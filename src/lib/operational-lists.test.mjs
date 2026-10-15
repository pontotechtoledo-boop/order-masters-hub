import { expect, test } from "bun:test";
import { initialList, matchesOrderSearch, warrantyNumber } from "./operational-lists";

test("garantias sem filtros mostram cinco registros", () => {
  expect(initialList([1,2,3,4,5,6,7], false)).toEqual([1,2,3,4,5]);
});
test("histórico de vendas sem datas mostra cinco registros", () => {
  expect(initialList([7,6,5,4,3,2,1], false)).toEqual([7,6,5,4,3]);
});
test("aparelhos em loja sem busca mostram cinco registros", () => {
  expect(initialList([8,7,6,5,4,3], false)).toEqual([8,7,6,5,4]);
});
test("filtros permitem consultar além dos cinco iniciais", () => {
  expect(initialList([1,2,3,4,5,6], true)).toHaveLength(6);
});
test("número da garantia é o número da OS", () => {
  expect(warrantyNumber("OS-123")).toBe("123");
});
test("consulta por OS, nome ou CPF", () => {
  expect(matchesOrderSearch("123", "OS-123", "João Silva", "123.456.789-09")).toBe(true);
  expect(matchesOrderSearch("joao", "OS-123", "João Silva", "123.456.789-09")).toBe(true);
  expect(matchesOrderSearch("12345678909", "OS-123", "João Silva", "123.456.789-09")).toBe(true);
  expect(matchesOrderSearch("999", "OS-123", "João Silva", "123.456.789-09")).toBe(false);
});