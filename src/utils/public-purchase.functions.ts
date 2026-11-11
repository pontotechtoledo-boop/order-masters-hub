import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { purchaseInput } from '@/lib/public-purchase';
import { findPlan } from '@/lib/subscriptions';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const startPublicPurchase=createServerFn({method:'POST'}).inputValidator(value=>purchaseInput.parse(value)).handler(async({data})=>{
  try {
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {createStripeClient,getStripeErrorMessage}=await import('@/lib/stripe.server');
    const {hashPurchaseToken}=await import('@/lib/public-purchase.server');
    const {data:exists,error:existsError}=await supabaseAdmin.rpc('registration_email_exists',{_email:data.email});
    if(existsError) throw new Error('Não foi possível conferir o cadastro.');
    // Same neutral reply as other refusals so the page never confirms which emails are registered.
    if(exists) return {error:'Não foi possível iniciar a contratação com estes dados. Se você já tem conta, entre no sistema para assinar.'};
    const stripe=createStripeClient(data.environment),plan=findPlan(data.priceId);
    const price=(await stripe.prices.list({lookup_keys:[plan.id]})).data[0];
    if(!price||!price.active||price.currency!=='brl'||price.unit_amount!==plan.amount||price.recurring?.interval!==plan.interval||price.recurring.interval_count!==plan.frequency) throw new Error('Plano indisponível neste ambiente.');
    // Expired unpaid reservations no longer prevent another attempt.
    await supabaseAdmin.from('public_subscription_purchases').update({status:'revoked'}).eq('email',data.email).eq('environment',data.environment).eq('status','pending').lt('expires_at',new Date().toISOString());
    const browserToken=crypto.randomUUID()+crypto.randomUUID();
    const {data:purchase,error}=await supabaseAdmin.from('public_subscription_purchases').insert({email:data.email,full_name:data.name,company_name:data.company,document:data.document,environment:data.environment,price_id:plan.id,browser_token_hash:await hashPurchaseToken(browserToken)}).select('id').single();
    if(error||!purchase) return {error:'Já existe um pagamento em aberto para este e-mail. Retome a janela original ou aguarde 30 minutos.'};
    try {
      // No legacy email match: this is a new purchase identity, not an authenticated user.
      const customer=await stripe.customers.create({email:data.email,name:data.name,metadata:{publicPurchaseId:purchase.id}});
      const session=await stripe.checkout.sessions.create({mode:'subscription',ui_mode:'embedded_page',customer:customer.id,line_items:[{price:price.id,quantity:1}],locale:'pt-BR',billing_address_collection:'required',customer_update:{address:'auto'},expires_at:Math.floor(Date.now()/1000)+1800,return_url:`https://serviceproos.app/comprar?purchase=${purchase.id}`,metadata:{publicPurchaseId:purchase.id},subscription_data:{metadata:{publicPurchaseId:purchase.id,checkoutId:purchase.id}}});
      if(!session.client_secret) throw new Error('Pagamento indisponível.');
      const {error:saveError}=await supabaseAdmin.from('public_subscription_purchases').update({gateway_session_id:session.id}).eq('id',purchase.id);
      if(saveError) {await stripe.checkout.sessions.expire(session.id);throw saveError;}
      return {clientSecret:session.client_secret,purchaseId:purchase.id,browserToken};
    }catch(error){await supabaseAdmin.from('public_subscription_purchases').update({status:'revoked'}).eq('id',purchase.id);return {error:getStripeErrorMessage(error)};}
  }catch(error){return {error:error instanceof Error?error.message:'Não foi possível iniciar a contratação.'};}
});

const statusInput=z.object({purchaseId:z.string().uuid(),browserToken:z.string().min(64).max(100)});
export const publicPurchaseStatus=createServerFn({method:'POST'}).inputValidator(value=>statusInput.parse(value)).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {hashPurchaseToken}=await import('@/lib/public-purchase.server');
  const {data:purchase}=await supabaseAdmin.from('public_subscription_purchases').select('status,environment,gateway_session_id').eq('id',data.purchaseId).eq('browser_token_hash',await hashPurchaseToken(data.browserToken)).maybeSingle();
  let receipt = null;
  if(purchase?.environment==='live' && ['paid','activated'].includes(purchase.status) && purchase.gateway_session_id) {
    try { const {receiptForPaidSession}=await import('@/lib/purchase-receipt.server'); receipt=await receiptForPaidSession(purchase.gateway_session_id); } catch { /* Measurement must never block access. */ }
  }
  return {status:purchase?.status??'unavailable',receipt};
});

export const activatePublicPurchase=createServerFn({method:'POST'}).inputValidator(value=>z.object({purchaseId:z.string().uuid(),token:z.string().min(64).max(100),password:z.string().min(8).max(128)}).parse(value)).handler(async({data})=>{
  try {
    const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
    const {hashPurchaseToken}=await import('@/lib/public-purchase.server');
    const {newPasswordSchema,passwordIdentityMessage,passwordErrorMessage}=await import('@/lib/password-guidance');
    const {data:purchase}=await supabaseAdmin.from('public_subscription_purchases').select('*').eq('id',data.purchaseId).eq('activation_token_hash',await hashPurchaseToken(data.token)).maybeSingle();
    if(!purchase||!purchase.invite_token_hash||!purchase.user_id||purchase.status!=='paid'||!purchase.activation_expires_at||Date.parse(purchase.activation_expires_at)<Date.now()) return {error:'Este link expirou ou já foi utilizado. Entre ou recupere sua senha.'};
    newPasswordSchema.parse(data.password);
    const identity=passwordIdentityMessage(data.password,purchase.full_name,purchase.company_name);if(identity)return {error:identity};
    const key=process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const client=createClient(process.env['SUPABASE_URL']!,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(url,{...init,headers});}}});
    const {data:auth,error}=await client.auth.verifyOtp({token_hash:purchase.invite_token_hash,type:'invite'});
    if(error||!auth.session||auth.user?.id!==purchase.user_id)return {error:'Este convite não é mais válido. Use “Esqueci minha senha” para recuperar o acesso.'};
    const {error:passwordError}=await client.auth.updateUser({password:data.password});
    if(passwordError)return {error:passwordErrorMessage(passwordError,'Não foi possível salvar a senha. Recupere o acesso em “Esqueci minha senha”.')};
    const {error:completionError}=await client.rpc('complete_public_purchase',{_id:purchase.id});if(completionError)throw completionError;
    const {sendTemplateEmail}=await import('@/lib/email-templates/send-email');
    try { await sendTemplateEmail('subscription-confirmation',purchase.email,{templateData:{name:purchase.full_name},idempotencyKey:`purchase-account-ready-${purchase.id}`}); } catch { console.error('Não foi possível enviar confirmação de cadastro concluído.'); }
    return {ok:true};
  }catch(error){return {error:error instanceof Error?error.message:'Não foi possível ativar sua conta.'};}
});

export const completeRecoveredPurchase=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:purchase}=await supabaseAdmin.from('public_subscription_purchases').select('id,email,full_name').eq('user_id',context.userId).eq('status','paid').maybeSingle();
  if(!purchase)return {ok:true};
  const {error}=await context.supabase.rpc('complete_public_purchase',{_id:purchase.id});if(error)throw error;
  const {sendTemplateEmail}=await import('@/lib/email-templates/send-email');
  try { await sendTemplateEmail('subscription-confirmation',purchase.email,{templateData:{name:purchase.full_name},idempotencyKey:`purchase-account-ready-${purchase.id}`}); } catch { console.error('Não foi possível enviar confirmação de cadastro concluído.'); }
  return {ok:true};
});