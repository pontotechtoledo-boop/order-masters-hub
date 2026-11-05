import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newPasswordSchema } from './password-guidance.ts';

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