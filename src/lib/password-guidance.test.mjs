import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPasswordSchema, passwordIdentityMessage } from './password-guidance.ts';

test('password requires at least eight characters', () => {
  assert.equal(newPasswordSchema.safeParse('Ab12!xy').success, false);
  assert.equal(newPasswordSchema.safeParse('Ab12!xyz').success, true);
});
test('password requires an uppercase letter', () => {
  assert.equal(newPasswordSchema.safeParse('ab12!xyz').success, false);
});
test('password requires a number', () => {
  assert.equal(newPasswordSchema.safeParse('Abcd!xyz').success, false);
});
test('password requires a special character, not whitespace', () => {
  assert.equal(newPasswordSchema.safeParse('Ab12 xyz').success, false);
  assert.equal(newPasswordSchema.safeParse('Ab12#xyz').success, true);
});
test('password rejects sequential numbers', () => {
  assert.equal(newPasswordSchema.safeParse('Arvore!1234').success, false);
  assert.equal(newPasswordSchema.safeParse('Arvore!4321').success, false);
  assert.equal(newPasswordSchema.safeParse('Arvore!47').success, true);
});
test('password avoids the personal name', () => {
  assert.notEqual(passwordIdentityMessage('Cristiano!47', 'Cristiano da Silva'), '');
  assert.equal(passwordIdentityMessage('Arvore!47', 'Cristiano da Silva'), '');
});
test('password avoids the company name', () => {
  assert.notEqual(passwordIdentityMessage('PontoTech!47', '', 'PontoTech'), '');
  assert.equal(passwordIdentityMessage('Arvore!47', '', 'PontoTech'), '');
});