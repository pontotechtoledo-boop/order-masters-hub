import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceAllowsAds, adChoiceAllows, paidInvoiceReceipt } from './ads-measurement.ts';
test('no banner permits Brazil but blocks consent and unresolved regions', () => {
  assert.equal(traceAllowsAds('h=serviceproos.app\nloc=BR', 'serviceproos.app'), true);
  for (const country of ['GB','DE','CH','CA','XX','T1']) assert.equal(traceAllowsAds(`h=serviceproos.app\nloc=${country}`, 'serviceproos.app'), false);
  assert.equal(traceAllowsAds('h=proxy.app\nloc=BR', 'serviceproos.app'), false);
  assert.equal(traceAllowsAds('', 'serviceproos.app'), false);
});
test('refusal and GPC block even otherwise permitted Brazil', () => {
  assert.equal(adChoiceAllows(null, false, true), true);
  assert.equal(adChoiceAllows('denied', false, true), false);
  assert.equal(adChoiceAllows('granted', true, true), false);
  assert.equal(adChoiceAllows('granted', false, false), false);
});
test('only real paid invoices count with actual amount and invoice deduplication ID', () => {
  const invoice = { id: 'in_example', status: 'paid', paid: true, livemode: true, amount_paid: 2990, currency: 'brl' };
  assert.deepEqual(paidInvoiceReceipt(invoice), { transactionId: 'in_example', value: 29.9, currency: 'BRL' });
  assert.equal(paidInvoiceReceipt({ ...invoice, livemode: false }), null);
  assert.equal(paidInvoiceReceipt({ ...invoice, paid: false }), null);
  assert.equal(paidInvoiceReceipt({ ...invoice, status: 'open' }), null);
  assert.equal(paidInvoiceReceipt({ ...invoice, amount_paid: 0 }), null);
});