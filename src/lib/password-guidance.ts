import { z } from 'zod';

export const passwordRules = [
  { label: 'Pelo menos 8 caracteres', test: (value: string) => value.length >= 8 },
  { label: 'Uma letra maiúscula (A–Z)', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Um número (0–9)', test: (value: string) => /[0-9]/.test(value) },
  { label: 'Um caractere especial (ex.: ! @ # $)', test: (value: string) => /[^\p{L}\p{N}\s]/u.test(value) },
];

export const newPasswordSchema = z.string().max(128, 'Use no máximo 128 caracteres.').superRefine((value, ctx) => {
  for (const rule of passwordRules) {
    if (!rule.test(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: rule.label });
  }
});

export function passwordErrorMessage(error: unknown, fallback: string) {
  const data = error as { code?: string; message?: string; reasons?: string[] } | null;
  const message = (data?.message ?? '').toLowerCase();
  if (data?.code === 'weak_password' || /weak|pwned|guess|fraca|adivinhar|vazamento/.test(message)) {
    return 'Essa senha foi recusada por ser muito comum ou conhecida em vazamentos. Mesmo atendendo aos requisitos abaixo, ela pode não ser segura. Escolha uma combinação exclusiva: duas palavras não relacionadas, uma letra maiúscula, números e um símbolo. Evite seu nome, nome da empresa e sequências como 123456.';
  }
  if (/same|different from the old/.test(message)) return 'A nova senha precisa ser diferente da anterior.';
  if (/session|expired|jwt/.test(message)) return 'O link expirou. Peça um novo em “Esqueci minha senha”.';
  return fallback;
}