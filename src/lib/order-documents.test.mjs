import { expect, test } from 'bun:test';
import { paperSettings } from './order-documents';
import { initialList, matchesOrderSearch } from './operational-lists';

test('emissão oferece cinco OS recentes e encontra uma antiga por nome, CPF e número', () => {
  const orders = Array.from({ length: 7 }, (_, i) => ({ number: `OS-${7-i}`, name: i === 6 ? 'Ana Souza' : 'Carlos', document: i === 6 ? '987.654.321-00' : '' }));
  expect(initialList(orders, false).map(o => o.number)).toEqual(['OS-7','OS-6','OS-5','OS-4','OS-3']);
  for (const query of ['Ana', '98765432100', 'OS-1']) {
    expect(initialList(orders.filter(o => matchesOrderSearch(query,o.number,o.name,o.document)), true).map(o => o.number)).toEqual(['OS-1']);
  }
});
test('impressoras comuns usam A4 e térmicas mantêm a largura do papel', () => {
  expect(paperSettings('a4').page).toBe('A4');
  expect(paperSettings('80mm').width).toBe('74mm');
  expect(paperSettings('58mm').width).toBe('52mm');
});