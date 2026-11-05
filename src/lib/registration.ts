export function normalizeRegistrationEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validRegistrationDocument(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (![11, 14].includes(digits.length) || /^(\d)\1+$/.test(digits)) return false;
  const cpf = digits.length === 11;
  for (let step = 0; step < 2; step++) {
    let sum = 0;
    let weight = 5 + step;
    const count = (cpf ? 9 : 12) + step;
    for (let i = 0; i < count; i++) {
      sum += Number(digits[i]) * (cpf ? 10 + step - i : weight);
      if (!cpf && --weight === 1) weight = 9;
    }
    const remainder = sum % 11;
    const check = cpf ? (sum * 10 % 11) % 10 : remainder < 2 ? 0 : 11 - remainder;
    if (check !== Number(digits[count])) return false;
  }
  return true;
}

// Auth deliberately returns an empty identity list for an existing confirmed email.
export function duplicateSignup(user: { identities?: unknown[] } | null, code?: string) {
  return code === 'user_already_exists' || code === 'email_exists' || Boolean(user?.identities && user.identities.length === 0);
}