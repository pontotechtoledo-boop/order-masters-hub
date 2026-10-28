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
