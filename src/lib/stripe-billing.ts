export type PaymentEnvironment = 'sandbox' | 'live';
export function stripeEnvironment(token: string | undefined): PaymentEnvironment {
  if (token?.startsWith('pk_test_')) return 'sandbox';
  if (token?.startsWith('pk_live_')) return 'live';
  throw new Error('Pagamentos indisponíveis nesta versão. Conclua a ativação do Stripe e publique novamente.');
}
export function stripeConfirmationKey(environment: PaymentEnvironment, invoiceId: string) {
  return `stripe-confirmation-${environment}-${invoiceId}`;
}
export function stripePeriod(subscription: { items?: { data?: Array<{ current_period_start?: number; current_period_end?: number }> }; current_period_start?: number; current_period_end?: number }) {
  const item = subscription.items?.data?.[0];
  const start = item?.current_period_start ?? subscription.current_period_start;
  const end = item?.current_period_end ?? subscription.current_period_end;
  return { periodStart: start ? new Date(start * 1000).toISOString() : null, periodEnd: end ? new Date(end * 1000).toISOString() : null };
}