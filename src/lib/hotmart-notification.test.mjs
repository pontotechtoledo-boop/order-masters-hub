import { describe, expect, it } from 'bun:test'
import { hotmartConfirmationKey } from './hotmart-notification'

describe('Hotmart confirmation emails', () => {
  it('confirms an approved first purchase', () => {
    expect(hotmartConfirmationKey('PURCHASE_APPROVED', 'ok', 'first-event', 'first-payment')).toBe('subscription-confirmation-first-payment')
  })
  it('confirms a renewed purchase with its own payment key', () => {
    expect(hotmartConfirmationKey('PURCHASE_APPROVED', 'ok', 'renewal-event', 'renewal-payment')).toBe('subscription-confirmation-renewal-payment')
  })
  it('uses the same key when a processed payment is retried', () => {
    expect(hotmartConfirmationKey('PURCHASE_APPROVED', 'duplicate', 'retry-event', 'first-payment')).toBe('subscription-confirmation-first-payment')
  })
  it('deduplicates approval and completion of the same payment', () => {
    expect(hotmartConfirmationKey('PURCHASE_COMPLETE', 'ok', 'completion-event', 'first-payment')).toBe('subscription-confirmation-first-payment')
  })
  it('does not confirm refunds', () => {
    expect(hotmartConfirmationKey('PURCHASE_REFUNDED', 'ok', 'refund-event', 'first-payment')).toBeNull()
  })
  it('does not confirm a payment that was not applied', () => {
    expect(hotmartConfirmationKey('PURCHASE_APPROVED', 'unknown_plan', 'bad-event')).toBeNull()
  })
})