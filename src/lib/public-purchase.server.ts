import { createStripeClient, type StripeEnv } from './stripe.server';
import { paidPurchaseCanActivate } from './public-purchase';

export async function hashPurchaseToken(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2,'0')).join('');
}

// Runs only after a signed, settled Stripe invoice has been checked by the webhook.
export async function provisionPaidPurchase(id: string, environment: StripeEnv) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const {data:purchase,error}=await supabaseAdmin.from('public_subscription_purchases').select('*').eq('id',id).eq('environment',environment).single();
  if(error||!purchase) throw new Error('Contratação não encontrada.');
  const payload = purchase.paid_payload as Record<string,unknown> | null;
  if(!payload || !paidPurchaseCanActivate(purchase.status,payload)) {
    if(purchase.status==='activated') return purchase;
    throw new Error('Pagamento não permite ativação.');
  }
  if(purchase.user_id && purchase.organization_id && purchase.invite_token_hash) return purchase;
  const {data:claimed,error:claimError}=await supabaseAdmin.rpc('claim_public_purchase_provisioning',{_id:id});
  if(claimError||!claimed) throw new Error('Ativação sendo preparada.');
  try {
    const {data:exists,error:existsError}=await supabaseAdmin.rpc('registration_email_exists',{_email:purchase.email});
    if(existsError) throw existsError;
    if(exists) throw new Error('Este e-mail já tem conta. A contratação precisa ser recuperada após autenticação.');
    const {data:invitation,error:inviteError}=await supabaseAdmin.auth.admin.generateLink({type:'invite',email:purchase.email,options:{data:{full_name:purchase.full_name,company_name:purchase.company_name,document:purchase.document},redirectTo:'https://serviceproos.app/ativar'}});
    if(inviteError||!invitation.user||!invitation.properties?.hashed_token) throw new Error('Não foi possível preparar o convite.');
    const userId=invitation.user.id;
    const {data:organization,error:orgError}=await supabaseAdmin.from('organizations').insert({name:purchase.company_name,email:purchase.email,document:purchase.document}).select('id').single();
    if(orgError||!organization) throw new Error('Não foi possível preparar a assistência.');
    const {error:memberError}=await supabaseAdmin.from('organization_members').insert({organization_id:organization.id,user_id:userId,role:'owner',active:true});
    if(memberError) throw memberError;
    const {error:intentError}=await supabaseAdmin.from('subscription_checkouts').insert({id:purchase.id,user_id:userId,organization_id:organization.id,price_id:purchase.price_id,environment:purchase.environment,gateway_session_id:purchase.gateway_session_id});
    if(intentError) throw intentError;
    const stripe=createStripeClient(environment);
    await stripe.customers.update(String(payload['customerId']),{metadata:{userId}});
    await stripe.subscriptions.update(String(payload['subscriptionId']),{metadata:{userId,organizationId:organization.id,checkoutId:purchase.id,publicPurchaseId:purchase.id}});
    const {error:saveError}=await supabaseAdmin.from('public_subscription_purchases').update({user_id:userId,organization_id:organization.id,invite_token_hash:invitation.properties.hashed_token,provisioning_until:null}).eq('id',id);
    if(saveError) throw saveError;
    return {...purchase,user_id:userId,organization_id:organization.id,invite_token_hash:invitation.properties.hashed_token};
  } catch(error) {
    await supabaseAdmin.from('public_subscription_purchases').update({provisioning_until:null}).eq('id',id);
    throw error;
  }
}