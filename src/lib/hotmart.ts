import { subscriptionPlans, type PlanId } from "./subscriptions";

/** Identifica o plano pelo valor cobrado na Hotmart (R$). */
export function planIdFromHotmartAmount(value: number | null | undefined): PlanId | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const cents = Math.round(value * 100);
  return subscriptionPlans.find(plan => plan.amount === cents)?.id ?? null;
}
