import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchaseInput, paidPurchaseCanActivate, publicPurchasePaymentPayload } from './public-purchase.ts';

const input={name:'Cliente Exemplo',company:'Oficina Exemplo',email:'TEST@EXAMPLE.COM',document:'58.007.400/0001-09',environment:'sandbox',priceId:'pontotech_monthly',acceptedTerms:true};
test('first paid invoice binds the subscription to the persisted purchase checkout',()=>{
  const id='efd260e1-d5d7-46c8-8585-a105fb112114';
  const payload=publicPurchasePaymentPayload({checkoutId:'untrusted',subscriptionId:'sub_example',priceId:'pontotech_monthly'},id);
  assert.equal(payload.checkoutId,id);
  assert.equal(payload.priceId,'pontotech_monthly');
  assert.throws(()=>publicPurchasePaymentPayload({},'untrusted'));
});
test('public purchase requires valid CPF or CNPJ',()=>{
  assert.equal(purchaseInput.safeParse(input).success,true);
  assert.equal(purchaseInput.safeParse({...input,document:'11111111111'}).success,false);
});
test('public purchase normalizes email',()=>assert.equal(purchaseInput.parse(input).email,'test@example.com'));
test('purchase accepts only catalog plans and explicit agreement',()=>{
  assert.equal(purchaseInput.safeParse({...input,priceId:'free'}).success,false);
  assert.equal(purchaseInput.safeParse({...input,acceptedTerms:false}).success,false);
});
test('only confirmed paid purchase with current period permits activation',()=>{
  const now=Date.parse('2026-11-05T00:00:00Z');
  const payload={status:'active',periodEnd:'2026-12-05T00:00:00Z'};
  assert.equal(paidPurchaseCanActivate('paid',payload,now),true);
  assert.equal(paidPurchaseCanActivate('pending',payload,now),false);
  assert.equal(paidPurchaseCanActivate('revoked',payload,now),false);
  assert.equal(paidPurchaseCanActivate('paid',{...payload,status:'unpaid'},now),false);
  assert.equal(paidPurchaseCanActivate('paid',{...payload,periodEnd:'2026-11-04T00:00:00Z'},now),false);
});