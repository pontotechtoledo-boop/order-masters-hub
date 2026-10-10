import { describe, expect, test } from "bun:test";
import { findPlan, hasPaidAccess, matchesCatalogPrice } from "./subscriptions";
describe("Planos aprovados", () => {
  test("mensal R$ 29,90 por mês", () => { expect(findPlan("pontotech_monthly")).toMatchObject({ amount: 2990, interval: "month", frequency: 1 }); });
  test("trimestral R$ 69,90 a cada três meses", () => { expect(findPlan("pontotech_quarterly")).toMatchObject({ amount: 6990, interval: "month", frequency: 3 }); });
  test("anual R$ 299,90 por ano", () => { expect(findPlan("pontotech_yearly")).toMatchObject({ amount: 29990, interval: "year", frequency: 1 }); });
  test("não aceita preço anual antigo ou impostos adicionais", () => {
    const price = { status: "active", tax_mode: "internal", unit_price: { amount: "29700", currency_code: "BRL" }, billing_cycle: { interval: "year", frequency: 1 } };
    expect(matchesCatalogPrice(price, "pontotech_yearly")).toBe(false);
    expect(matchesCatalogPrice({ ...price, unit_price: { amount: "29990", currency_code: "BRL" } }, "pontotech_yearly")).toBe(true);
    expect(matchesCatalogPrice({ ...price, tax_mode: "location" }, "pontotech_yearly")).toBe(false);
  });
  test("cancelamento preserva período pago", () => {
    expect(hasPaidAccess({ status: "canceled", current_period_end: "2026-11-01T00:00:00Z" }, Date.parse("2026-10-10T00:00:00Z"))).toBe(true);
    expect(hasPaidAccess({ status: "canceled", current_period_end: "2026-11-01T00:00:00Z" }, Date.parse("2026-11-01T00:00:00Z"))).toBe(false);
  });
  test("tolerância termina exatamente em sete dias", () => {
    const sub = { status: "past_due", current_period_end: null, first_failed_at: "2026-10-10T00:00:00Z" };
    expect(hasPaidAccess(sub, Date.parse("2026-10-16T23:59:59Z"))).toBe(true);
    expect(hasPaidAccess(sub, Date.parse("2026-10-17T00:00:00Z"))).toBe(false);
  });
});