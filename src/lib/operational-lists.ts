export const INITIAL_LIST_LIMIT = 5;

export function initialList<T>(items: T[], filtered: boolean): T[] {
  return filtered ? items : items.slice(0, INITIAL_LIST_LIMIT);
}

export function matchesOrderSearch(query: string, number: string, name: string, document: string): boolean {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const text = normalize(query);
  if (!text) return true;
  if (/^(?:os\s*[-#]?\s*|#)?\d+$/i.test(text)) {
    const digits = text.replace(/\D/g, "");
    if (/^(?:os|#)/i.test(text)) return Number(number.replace(/\D/g, "")) === Number(digits);
    return Number(number.replace(/\D/g, "")) === Number(digits) || document.replace(/\D/g, "").includes(digits);
  }
  const digits = text.replace(/\D/g, "");
  return normalize(name).includes(text) || normalize(number).includes(text) || (digits.length >= 3 && document.replace(/\D/g, "").includes(digits));
}

export const warrantyNumber = (orderNumber: string | number) => String(orderNumber).replace(/^OS-/, "");