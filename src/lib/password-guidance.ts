import { z } from 'zod';

export const passwordRules = [
  { label: 'Pelo menos 8 caracteres', test: (value: string) => value.length >= 8 },
  { label: 'Uma letra maiúscula (A–Z)', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Um número (0–9)', test: (value: string) => /[0-9]/.test(value) },
  { label: 'Um caractere especial (ex.: ! @ # $)', test: (value: string) => /[^\p{L}\p{N}\s]/u.test(value) },
  { label: 'Sem números sequenciais (ex.: 1234 ou 4321)', test: (value: string) => !/(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(value) },
];

export function passwordIdentityMessage(password: string, name = '', company = '') {
  const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const value = normalize(password);
  const words = [name, company].flatMap(identity => identity.split(/\s+/)).map(normalize).filter(word => word.length >= 4);
  return words.some(word => value.includes(word)) ? 'Não use seu nome nem o nome da assistência na senha.' : '';
}

export const newPasswordSchema = z.string().max(128, 'Use no máximo 128 caracteres.').superRefine((value, ctx) => {
  for (const rule of passwordRules) {
    if (!rule.test(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: rule.label });
  }
});

export function passwordErrorMessage(error: unknown, fallback: string) {
  const data = error as { code?: string; message?: string; reasons?: string[] } | null;
  const message = (data?.message ?? '').toLowerCase();
  if (data?.code === 'weak_password' || /weak|pwned|guess|fraca|adivinhar|vazamento/.test(message)) {
    return 'Essa combinação já é muito usada e não pôde ser aceita. Tente duas palavras que não sejam seu nome nem o da assistência, acrescente um símbolo e números fora de sequência. Não é necessário criar uma senha complicada.';
  }
  if (/same|different from the old/.test(message)) return 'A nova senha precisa ser diferente da anterior.';
  if (/session|expired|jwt/.test(message)) return 'O link expirou. Peça um novo em “Esqueci minha senha”.';
  return fallback;
}