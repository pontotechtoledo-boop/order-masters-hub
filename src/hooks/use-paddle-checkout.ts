import { useState } from "react";
import { getPaddlePriceId, initializePaddle } from "@/lib/paddle";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);
  const openCheckout = async (user: { id: string; email?: string }, organizationId: string) => {
    setLoading(true);
    try {
      await initializePaddle();
      const priceId = await getPaddlePriceId("pontotech_monthly");
      window.Paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: { userId: user.id, organizationId },
        settings: { displayMode: "overlay", successUrl: `${window.location.origin}/dashboard?checkout=success`, allowLogout: false, variant: "one-page" },
      });
    } finally { setLoading(false); }
  };
  return { openCheckout, loading };
}