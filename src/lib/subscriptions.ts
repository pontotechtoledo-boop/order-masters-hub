export const subscriptionPlans = [
  { id: "pontotech_monthly", name: "Mensal", amount: 2990, interval: "month", frequency: 1, period: "por mês", renewal: "Renovação a cada mês" },
  { id: "pontotech_quarterly", name: "Trimestral", amount: 6990, interval: "month", frequency: 3, period: "a cada 3 meses", renewal: "Renovação a cada 3 meses" },
  { id: "pontotech_yearly", name: "Anual", amount: 29990, interval: "year", frequency: 1, period: "por ano", renewal: "Renovação a cada ano" },
] as const;
export type PlanId = (typeof subscriptionPlans)[number]["id"];
export const formatPlanPrice = (amount: number) => (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function findPlan(id: string) {
  const plan = subscriptionPlans.find(plan => plan.id === id);
  if (!plan) throw new Error("Plano inválido.");
  return plan;
}
export function hasPaidAccess(subscription: { status: string; current_period_end: string | null; first_failed_at?: string | null } | null, now = Date.now()) {
  if (!subscription) return false;
  if (subscription.status === "past_due") return Boolean(subscription.first_failed_at && now < Date.parse(subscription.first_failed_at) + 7 * 86400000);
  if (subscription.status === "canceled") return Boolean(subscription.current_period_end && Date.parse(subscription.current_period_end) > now);
  return ["active", "trialing"].includes(subscription.status) && (!subscription.current_period_end || Date.parse(subscription.current_period_end) > now);
}
export function matchesCatalogPrice(price: { status: string; tax_mode: string; unit_price: { amount: string; currency_code: string }; billing_cycle: { interval: string; frequency: number } | null }, id: string) {
  const plan = findPlan(id);
  return price.status === "active" && price.tax_mode === "internal" && price.unit_price.currency_code === "BRL" && Number(price.unit_price.amount) === plan.amount && price.billing_cycle?.interval === plan.interval && price.billing_cycle.frequency === plan.frequency;
}