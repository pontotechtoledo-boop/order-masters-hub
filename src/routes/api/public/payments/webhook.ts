import { createFileRoute } from '@tanstack/react-router';
import { createStripeClient, verifyWebhook, type StripeEnv } from '@/lib/stripe.server';
import { stripePeriod, stripeConfirmationKey } from '@/lib/stripe-billing';

export const Route = createFileRoute('/api/public/payments/webhook')({ server: { handlers: { POST: async ({ request }) => {
  const environment = new URL(request.url).searchParams.get('env');
  if (environment !== 'sandbox' && environment !== 'live') return new Response('Ambiente inválido', { status: 400 });
  let event;
  try { event = await verifyWebhook(request, environment); }
  catch { return new Response('Assinatura inválida', { status: 400 }); }
  try {
    const normalized = await normalizeEvent(event, environment);
    if (!normalized) return Response.json({ received: true });
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    if (normalized.publicPurchaseId) {
      const { data: publicPurchase } = await supabaseAdmin.from('public_subscription_purchases').select('status,user_id').eq('id',normalized.publicPurchaseId).eq('environment',environment).maybeSingle();
      if (!publicPurchase) throw new Error('Contratação pública ausente.');
      if (publicPurchase.status === 'revoked' && normalized.invoiceId) return Response.json({received:true});
      if (normalized.type === 'payment.revoked') {
        const {error:revokeError}=await supabaseAdmin.rpc('revoke_public_purchase',{_id:normalized.publicPurchaseId,_occurred_at:new Date(event.created*1000).toISOString()});if(revokeError)throw revokeError;
        if (!publicPurchase.user_id) return Response.json({received:true});
      } else if (normalized.invoiceId && !publicPurchase.user_id) {
        const {error:recordError}=await supabaseAdmin.rpc('record_public_purchase_payment',{_id:normalized.publicPurchaseId,_session_id:normalized.payload.sessionId??'',_price_id:normalized.payload.priceId??'',_environment:environment,_payload:JSON.parse(JSON.stringify(normalized.payload)),_paid_at:new Date(event.created*1000).toISOString()});
        if(recordError)throw recordError;
      } else if (!publicPurchase.user_id) {
        // Public onboarding waits for invoice.paid, not a checkout return or created subscription.
        return Response.json({received:true});
      }
      if (normalized.invoiceId && publicPurchase.status !== 'activated') {
        const {provisionPaidPurchase,hashPurchaseToken}=await import('@/lib/public-purchase.server');
        const purchase=await provisionPaidPurchase(normalized.publicPurchaseId,environment);
        if(purchase.status==='revoked')return Response.json({received:true});
        // Auth's invitation capability is random and stable across delivery retries;
        // never derive an activation capability from a project-wide secret.
        const token=purchase.invite_token_hash;
        if(!token)throw new Error('Convite de ativação ausente.');
        const {error:tokenError}=await supabaseAdmin.from('public_subscription_purchases').update({activation_token_hash:await hashPurchaseToken(token),activation_expires_at:purchase.activation_expires_at??new Date(Date.now()+7*86400000).toISOString()}).eq('id',purchase.id).eq('status','paid');
        if(tokenError)throw tokenError;
        const {error:paymentError}=await supabaseAdmin.rpc('process_subscription_payment',{_event_id:event.id,_environment:environment,_occurred_at:new Date(event.created*1000).toISOString(),_event_type:normalized.type,_payload:JSON.parse(JSON.stringify({...normalized.payload,checkoutId:purchase.id}))});
        if(paymentError)throw paymentError;
        const {sendTemplateEmail}=await import('@/lib/email-templates/send-email');
        await sendTemplateEmail('purchase-activation',purchase.email,{templateData:{name:purchase.full_name,activationUrl:`https://serviceproos.app/ativar?purchase=${purchase.id}&token=${token}`},idempotencyKey:stripeConfirmationKey(environment,normalized.invoiceId)});
        return Response.json({received:true});
      }
    }
    const { error } = await supabaseAdmin.rpc('process_subscription_payment', { _event_id: event.id, _environment: environment, _occurred_at: new Date(event.created * 1000).toISOString(), _event_type: normalized.type, _payload: JSON.parse(JSON.stringify(normalized.payload)) });
    if (error) throw error;
    // Read the verified association, not a browser-provided email or organization.
    if (normalized.invoiceId) {
      const { data: sub } = await supabaseAdmin.from('subscriptions').select('user_id,payment_confirmed_at').eq('gateway_subscription_id', normalized.payload.subscriptionId).eq('environment', environment).maybeSingle();
      if (!sub?.payment_confirmed_at) throw new Error('Pagamento ainda não associado.');
      const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(sub.user_id);
      if (userError || !user?.email) throw new Error('Destinatário não encontrado.');
      const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
      await sendTemplateEmail('subscription-confirmation', user.email, { templateData: { name: user.user_metadata?.['full_name'] }, idempotencyKey: stripeConfirmationKey(environment, normalized.invoiceId) });
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('Falha no processamento Stripe', error);
    return new Response('Falha no processamento', { status: 500 });
  }
} } } });

async function normalizeEvent(event: { type: string; data: { object: Record<string, unknown> } }, environment: StripeEnv) {
  const stripe = createStripeClient(environment);
  const object = event.data.object;
  let subscriptionId: string | undefined;
  let sessionId: string | undefined;
  let invoiceId: string | undefined;
  let type: string;
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = await stripe.checkout.sessions.retrieve(String(object['id']));
    if (session.mode !== 'subscription' || session.payment_status === 'unpaid') return null;
    subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    sessionId = session.id;
    type = 'checkout.completed';
  } else if (['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)) {
    subscriptionId = String(object['id']);
    type = event.type === 'customer.subscription.deleted' ? 'subscription.canceled' : 'subscription.upsert';
  } else if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = await stripe.invoices.retrieve(String(object['id']));
    const reference = invoice.parent?.subscription_details?.subscription;
    subscriptionId = typeof reference === 'string' ? reference : reference?.id;
    if (!subscriptionId) return null;
    type = event.type;
    if (event.type === 'invoice.paid') invoiceId = invoice.id;
  } else if (event.type === 'charge.refunded' || event.type === 'charge.dispute.created') {
    const chargeId = event.type === 'charge.refunded' ? String(object['id']) : typeof object['charge'] === 'string' ? object['charge'] : undefined;
    if (!chargeId) return null;
    const charge = await stripe.charges.retrieve(chargeId);
    if (event.type === 'charge.refunded' && !charge.refunded) return null;
    const payment = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!payment) return null;
    const sessions = await stripe.checkout.sessions.list({ payment_intent: payment, limit: 1 });
    let session = sessions.data[0];
    // Subscription invoices aren't always linked through payment_intent checkout filters.
    if (!session) {
      const invoicePayments = await stripe.invoicePayments.list({ payment: { type: 'payment_intent', payment_intent: payment }, limit: 1 });
      const invoiceReference = invoicePayments.data[0]?.invoice;
      const invoice = invoiceReference ? await stripe.invoices.retrieve(typeof invoiceReference === 'string' ? invoiceReference : invoiceReference.id) : null;
      const reference = invoice?.parent?.subscription_details?.subscription;
      subscriptionId = typeof reference === 'string' ? reference : reference?.id;
    } else { subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id; }
    if (!subscriptionId) return null;
    // Prevent further renewal after a full refund or a payment dispute.
    const current = await stripe.subscriptions.retrieve(subscriptionId);
    if (current.status !== 'canceled') await stripe.subscriptions.cancel(subscriptionId);
    type = 'payment.revoked';
  } else { return null; }
  if (!subscriptionId) return null;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  if (!item) throw new Error('Plano da assinatura ausente.');
  // All events can reconstruct the authoritative checkout association, even when
  // invoice.paid arrives before checkout.session.completed.
  if (!sessionId) {
    const sessions = await stripe.checkout.sessions.list({ subscription: subscriptionId, limit: 1 });
    sessionId = sessions.data[0]?.id;
  }
  const period = stripePeriod(subscription);
  return { type, invoiceId, publicPurchaseId: subscription.metadata['publicPurchaseId'], payload: {
    subscriptionId, sessionId, checkoutId: subscription.metadata['checkoutId'],
    customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    priceId: item.price.lookup_key ?? item.price.metadata['lovable_external_id'],
    status: subscription.status, ...period, cancelAtPeriodEnd: subscription.cancel_at_period_end,
  } };
}
