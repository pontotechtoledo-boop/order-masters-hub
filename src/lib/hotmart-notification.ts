export function hotmartConfirmationKey(event: string, result: unknown, eventId: string, transaction?: string) {
  if (!['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'].includes(event)) return null
  if (result !== 'ok' && result !== 'duplicate') return null
  return `subscription-confirmation-${transaction || eventId}`
}