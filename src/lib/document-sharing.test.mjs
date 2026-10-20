import { expect, test } from 'bun:test';
import { whatsappRecipient, whatsappLink, issuedOrderStage } from './document-sharing';

test('envio manual usa o WhatsApp do cliente com DDD e código brasileiro', () => {
  expect(whatsappRecipient('(45) 99999-1234')).toBe('5545999991234');
  expect(whatsappRecipient('+55 (45) 99999-1234')).toBe('5545999991234');
  expect(whatsappLink('(45) 99999-1234', 'OS 12')).toBe('https://wa.me/5545999991234?text=OS%2012');
  expect(() => whatsappRecipient('123')).toThrow();
});

test('emissão inicia apenas uma OS aberta e não reabre uma finalizada', () => {
  expect(issuedOrderStage('Aberta')).toBe('Em processo');
  expect(issuedOrderStage('Finalizada')).toBe('Finalizada');
  expect(issuedOrderStage('Aguardando aprovação')).toBe('Aguardando aprovação');
});