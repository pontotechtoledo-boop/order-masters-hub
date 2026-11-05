import { describe, expect, test } from "bun:test";
import { findPlan, hasPaidAccess, isInRenewalGrace, selectedPlan } from "./subscriptions";
describe("Planos aprovados", () => {
  test("escolha antecipada só aceita os três planos do catálogo", () => {
    for (const id of ["pontotech_monthly", "pontotech_quarterly", "pontotech_yearly"]) expect(selectedPlan(id)).toBe(id);
    expect(selectedPlan("outro_plano")).toBeUndefined();
    expect(selectedPlan(null)).toBeUndefined();
  });
  test("conta sem assinatura ou período pago não libera recursos", () => {
    expect(hasPaidAccess(null)).toBe(false);
    expect(hasPaidAccess({ status: "active", current_period_end: null })).toBe(false);
    expect(hasPaidAccess({ status: "pending", current_period_end: "2026-12-05T00:00:00Z" }, Date.parse("2026-11-05T00:00:00Z"))).toBe(false);
  });
  for (const day of ["2026-11-03", "2026-11-10"]) test(`renovar em ${day} restaura acesso antes ou depois da tolerância`, () => {
    const now = Date.parse(`${day}T00:00:00Z`);
    const renewed = { status: "active", first_failed_at: null, current_period_end: "2026-12-10T00:00:00Z" };
    expect(hasPaidAccess(renewed, now)).toBe(true);
    expect(isInRenewalGrace(renewed, now)).toBe(false);
  });
  test("mensal R$ 29,90 por mês", () => { expect(findPlan("pontotech_monthly")).toMatchObject({ amount: 2990, interval: "month", frequency: 1 }); });
  test("trimestral R$ 69,90 a cada três meses", () => { expect(findPlan("pontotech_quarterly")).toMatchObject({ amount: 6990, interval: "month", frequency: 3 }); });
  test("anual R$ 299,90 por ano", () => { expect(findPlan("pontotech_yearly")).toMatchObject({ amount: 29990, interval: "year", frequency: 1 }); });
  test("rejeita plano desconhecido", () => { expect(() => findPlan("pontotech_weekly")).toThrow("Plano inválido."); });
  test("assinatura renovada libera uso e não mantém aviso de vencimento", () => {
    const renewed = { status: "active", current_period_end: "2026-12-05T00:00:00Z" };
    expect(hasPaidAccess(renewed, Date.parse("2026-11-05T00:00:00Z"))).toBe(true);
    expect(isInRenewalGrace(renewed, Date.parse("2026-11-05T00:00:00Z"))).toBe(false);
  });
  test("reembolso ou contestação não libera escrita", () => expect(hasPaidAccess({ status: "unpaid", current_period_end: "2026-12-05T00:00:00Z" }, Date.parse("2026-11-05T00:00:00Z"))).toBe(false));
  test("cancelamento preserva período pago", () => {
    expect(hasPaidAccess({ status: "canceled", current_period_end: "2026-11-01T00:00:00Z" }, Date.parse("2026-10-10T00:00:00Z"))).toBe(true);
    expect(hasPaidAccess({ status: "canceled", current_period_end: "2026-11-01T00:00:00Z" }, Date.parse("2026-11-01T00:00:00Z"))).toBe(false);
  });
  test("tolerância termina exatamente em sete dias", () => {
    const sub = { status: "past_due", current_period_end: null, first_failed_at: "2026-10-10T00:00:00Z" };
    expect(hasPaidAccess(sub, Date.parse("2026-10-16T23:59:59Z"))).toBe(true);
    expect(hasPaidAccess(sub, Date.parse("2026-10-17T00:00:00Z"))).toBe(false);
  });
  test("plano vencido continua por mais 7 dias com aviso", () => {
    const sub = { status: "active", current_period_end: "2026-11-01T00:00:00Z" };
    expect(isInRenewalGrace(sub, Date.parse("2026-11-03T00:00:00Z"))).toBe(true);
    expect(hasPaidAccess(sub, Date.parse("2026-11-07T23:59:59Z"))).toBe(true);
    expect(hasPaidAccess(sub, Date.parse("2026-11-08T00:00:00Z"))).toBe(false);
  });
});
