import { subscriptionPlans, type PlanId } from "./subscriptions";

export const hotmartCheckoutLinks: Record<PlanId, string> = {
  pontotech_monthly: "https://pay.hotmart.com/W108179804M?off=m9mvnjhc",
  pontotech_quarterly: "https://pay.hotmart.com/W108179804M?off=qo10u1si",
  pontotech_yearly: "https://pay.hotmart.com/W108179804M?off=m8p4t7ri",
};

/** Identifica o plano pelo valor cobrado na Hotmart (R$). */
export function planIdFromHotmartAmount(value: number | null | undefined): PlanId | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const cents = Math.round(value * 100);
  return subscriptionPlans.find(plan => plan.amount === cents)?.id ?? null;
}

/** A oferta identifica o ciclo mesmo com descontos, taxas ou conversão de moeda. */
export function planIdFromHotmartPurchase(purchase: {
  offer?: { code?: string | undefined } | undefined;
  price?: { value?: number | undefined; currency_value?: string | undefined } | undefined;
  full_price?: { value?: number | undefined; currency_value?: string | undefined } | undefined;
} | null | undefined): PlanId | null {
  const offerCode = purchase?.offer?.code;
  if (offerCode) {
    const match = subscriptionPlans.find(plan => new URL(hotmartCheckoutLinks[plan.id]).searchParams.get("off") === offerCode);
    if (match) return match.id;
  }
  for (const price of [purchase?.price, purchase?.full_price]) {
    if (price?.currency_value && price.currency_value !== "BRL") continue;
    const plan = planIdFromHotmartAmount(price?.value);
    if (plan) return plan;
  }
  return null;
}
