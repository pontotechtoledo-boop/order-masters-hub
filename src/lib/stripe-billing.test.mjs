import { expect, test } from 'bun:test';
import { stripeEnvironment, stripeConfirmationKey, stripePeriod } from './stripe-billing';
test('test token selects test environment', () => expect(stripeEnvironment('pk_test_sample')).toBe('sandbox'));
test('live token selects live environment', () => expect(stripeEnvironment('pk_live_sample')).toBe('live'));
test('missing or invalid token never defaults to live', () => { expect(() => stripeEnvironment(undefined)).toThrow(); expect(() => stripeEnvironment('live_invalid')).toThrow(); });
test('renewals have unique invoice keys; retries reuse the key', () => { expect(stripeConfirmationKey('live','in_1')).toBe('stripe-confirmation-live-in_1'); expect(stripeConfirmationKey('live','in_2')).not.toBe(stripeConfirmationKey('live','in_1')); expect(stripeConfirmationKey('sandbox','in_1')).not.toBe(stripeConfirmationKey('live','in_1')); });
test('Stripe period comes from paid subscription item', () => expect(stripePeriod({items:{data:[{current_period_start:1793836800,current_period_end:1796428800}]}})).toEqual({periodStart:'2026-11-05T00:00:00.000Z',periodEnd:'2026-12-05T00:00:00.000Z'}));
test('legacy Stripe period remains supported', () => expect(stripePeriod({current_period_start:1793836800,current_period_end:1796428800})).toEqual({periodStart:'2026-11-05T00:00:00.000Z',periodEnd:'2026-12-05T00:00:00.000Z'}));