import { createStripeClient } from './stripe.server';
import { paidInvoiceReceipt } from './ads-measurement';
export async function receiptForPaidSession(sessionId: string) {
  const stripe = createStripeClient('live');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session.livemode || session.mode !== 'subscription' || session.payment_status !== 'paid' || session.status !== 'complete' || !session.invoice) return null;
  const invoice = await stripe.invoices.retrieve(typeof session.invoice === 'string' ? session.invoice : session.invoice.id);
  return paidInvoiceReceipt({ ...invoice, paid: invoice.status === 'paid' && invoice.amount_remaining === 0 });
}