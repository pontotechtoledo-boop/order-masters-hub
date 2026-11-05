import { useCallback } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { createSubscriptionCheckout } from '@/utils/subscriptions.functions';

export function StripeEmbeddedCheckout({ organizationId, priceId, onError }: { organizationId: string; priceId: string; onError: (message: string) => void }) {
  const fetchClientSecret = useCallback(async () => {
    try {
      const result = await createSubscriptionCheckout({ data: { organizationId, priceId, environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/assinatura?session_id={CHECKOUT_SESSION_ID}` } });
      if ('error' in result) throw new Error(result.error);
      if (!result.clientSecret) throw new Error('O Stripe não retornou o formulário de pagamento.');
      return result.clientSecret;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível abrir o pagamento.';
      onError(message);
      throw error;
    }
  }, [organizationId, priceId, onError]);
  return <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}><EmbeddedCheckout /></EmbeddedCheckoutProvider>;
}