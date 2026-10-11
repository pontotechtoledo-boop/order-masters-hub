import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPaddleEnvironment, initializePaddle } from "@/lib/paddle";
import { createSubscriptionCheckout } from "@/utils/subscriptions.functions";
import type { PlanId } from "@/lib/subscriptions";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);
  const createCheckout = useServerFn(createSubscriptionCheckout);
  const openCheckout = async (organizationId: string, priceId: PlanId) => {
    setLoading(true);
    try {
      await initializePaddle();
      const { transactionId } = await createCheckout({ data: { organizationId, priceId, environment: getPaddleEnvironment() } });
      if (!window.Paddle) throw new Error("Pagamentos indisponíveis.");
      window.Paddle.Checkout.open({
        transactionId,
        settings: { displayMode: "overlay", locale: "pt", successUrl: `${window.location.origin}/assinatura?checkout=success`, allowLogout: false, variant: "one-page" },
      });
    } finally { setLoading(false); }
  };
  return { openCheckout, loading };
}