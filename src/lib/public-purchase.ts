import { z } from 'zod';
import { validRegistrationDocument } from './registration';
import { selectedPlan } from './subscriptions';

export const purchaseInput = z.object({
  name: z.string().trim().min(2).max(200),
  company: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  document: z.string().max(18).refine(validRegistrationDocument, 'Informe um CPF ou CNPJ válido.').transform(value => value.replace(/\D/g, '')),
  priceId: z.string().refine(value => Boolean(selectedPlan(value)), 'Plano inválido'),
  environment: z.enum(['sandbox', 'live']),
  acceptedTerms: z.literal(true),
});

export function paidPurchaseCanActivate(status: string, payload: Record<string, unknown>, now = Date.now()) {
  const end = typeof payload['periodEnd'] === 'string' ? Date.parse(payload['periodEnd']) : NaN;
  return status === 'paid' && ['active', 'trialing'].includes(String(payload['status'])) && end > now;
}