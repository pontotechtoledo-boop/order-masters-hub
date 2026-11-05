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
    let userId=purchase.user_id;
    let inviteToken=purchase.invite_token_hash;
    if(!userId){
      const {data:owned}=await supabaseAdmin.rpc('public_purchase_owned_user',{_id:id});
      userId=owned;
    }
    if(!userId){
      const {data:exists,error:existsError}=await supabaseAdmin.rpc('registration_email_exists',{_email:purchase.email});
      if(existsError)throw existsError;
      if(exists)throw new Error('Este e-mail já tem conta. A contratação precisa ser recuperada após autenticação.');
    }
    if(!inviteToken){
      const {data:invitation,error:inviteError}=await supabaseAdmin.auth.admin.generateLink({type:'invite',email:purchase.email,options:{data:{full_name:purchase.full_name,company_name:purchase.company_name,document:purchase.document,public_purchase_id:purchase.id},redirectTo:'https://serviceproos.app/ativar'}});
      if(inviteError||!invitation.user||!invitation.properties?.hashed_token)throw new Error('Não foi possível preparar o convite.');
      if(userId&&userId!==invitation.user.id)throw new Error('Conta de ativação divergente.');
      userId=invitation.user.id;inviteToken=invitation.properties.hashed_token;
      const {error:identityError}=await supabaseAdmin.from('public_subscription_purchases').update({user_id:userId,invite_token_hash:inviteToken}).eq('id',id);
      if(identityError)throw identityError;
    }
    if(!userId)throw new Error('Conta ausente.');
    const {data:organizationId,error:orgError}=await supabaseAdmin.rpc('initialize_public_purchase_identity',{_id:id,_user_id:userId});
    if(orgError||!organizationId)throw new Error('Não foi possível preparar a assistência.');
    const stripe=createStripeClient(environment);
    await stripe.customers.update(String(payload['customerId']),{metadata:{userId}});
    await stripe.subscriptions.update(String(payload['subscriptionId']),{metadata:{userId,organizationId,checkoutId:purchase.id,publicPurchaseId:purchase.id}});
    const {error:saveError}=await supabaseAdmin.from('public_subscription_purchases').update({provisioning_until:null}).eq('id',id);
    if(saveError) throw saveError;
    return {...purchase,user_id:userId,organization_id:organizationId,invite_token_hash:inviteToken};
  } catch(error) {
    await supabaseAdmin.from('public_subscription_purchases').update({provisioning_until:null}).eq('id',id);
    throw error;
  }
}