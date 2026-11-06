export const GOOGLE_ADS_DESTINATION = 'AW-17105796606/VM0SCNrWs9QaEP771tw_';
export const GOOGLE_ADS_TAG = 'AW-17105796606';
const regulated = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH','CA']);
export type PurchaseReceipt = { transactionId: string; value: number; currency: string };
export function traceAllowsAds(trace: string, hostname: string) {
  const host = trace.match(/^h=(.+)$/m)?.[1]?.trim().toLowerCase();
  const country = trace.match(/^loc=([A-Z0-9]{2})$/m)?.[1];
  return host === hostname.toLowerCase() && Boolean(country && country !== 'XX' && country !== 'T1' && !regulated.has(country));
}
export function adChoiceAllows(choice: string | null, gpc: boolean, regionAllowed: boolean) {
  // This no-banner route never treats a stale grant as permission in a blocked region.
  return !gpc && choice !== 'denied' && regionAllowed;
}
export function paidInvoiceReceipt(invoice: { id: string; status: string | null; paid: boolean; livemode: boolean; amount_paid: number; currency: string }): PurchaseReceipt | null {
  if (!invoice.livemode || !invoice.paid || invoice.status !== 'paid' || invoice.amount_paid <= 0) return null;
  return { transactionId: invoice.id, value: invoice.amount_paid / 100, currency: invoice.currency.toUpperCase() };
}