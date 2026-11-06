import { useCallback, useRef } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { createSubscriptionCheckout, getCheckoutPurchaseReceipt } from '@/utils/subscriptions.functions';
import { reportPaidPurchase } from '@/lib/ads-measurement-browser';

export function StripeEmbeddedCheckout({ organizationId, priceId, onError }: { organizationId: string; priceId: string; onError: (message: string) => void }) {
  const sessionId = useRef<string | null>(null);
  const onComplete = async () => {
    const id = sessionId.current;
    if (!id || getStripeEnvironment() !== 'live') return;
    for (let attempt = 0; attempt < 10; attempt++) {
      try { const result = await getCheckoutPurchaseReceipt({ data: { sessionId: id } }); if (result.receipt) { await reportPaidPurchase(result.receipt); return; } } catch { return; }
      await new Promise(resolve => window.setTimeout(resolve, 3000));
    }
  };
  const fetchClientSecret = useCallback(async () => {
    try {
      const result = await createSubscriptionCheckout({ data: { organizationId, priceId, environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/assinatura?session_id={CHECKOUT_SESSION_ID}` } });
      if ('error' in result) throw new Error(result.error);
      if (!result.clientSecret) throw new Error('O Stripe não retornou o formulário de pagamento.');
      sessionId.current = result.sessionId;
      return result.clientSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível abrir o pagamento.';
      onError(message);
      throw error;
    }
  }, [organizationId, priceId, onError]);
  return <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret, onComplete }}><EmbeddedCheckout /></EmbeddedCheckoutProvider>;
}