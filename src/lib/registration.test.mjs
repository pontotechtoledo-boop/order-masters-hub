import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validRegistrationDocument, normalizeRegistrationEmail, duplicateSignup } from './registration.ts';

test('individual signup requires a valid CPF', () => {
  assert.equal(validRegistrationDocument('529.982.247-25'), true);
  assert.equal(validRegistrationDocument('529.982.247-26'), false);
  assert.equal(validRegistrationDocument('111.111.111-11'), false);
  assert.equal(validRegistrationDocument(''), false);
});
test('company signup requires a valid CNPJ', () => {
  assert.equal(validRegistrationDocument('58.007.400/0001-09'), true);
  assert.equal(validRegistrationDocument('58.007.400/0001-08'), false);
});
test('same email has a single normalized login regardless of case or whitespace', () => {
  assert.equal(normalizeRegistrationEmail(' TEST@Example.com '), normalizeRegistrationEmail('test@example.com'));
});
test('Auth duplicate responses never count as successful new accounts', () => {
  assert.equal(duplicateSignup({ identities: [] }), true);
  assert.equal(duplicateSignup(null, 'user_already_exists'), true);
  assert.equal(duplicateSignup({ identities: [{ id: 'new' }] }), false);
});