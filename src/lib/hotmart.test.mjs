import { expect, test } from "bun:test";
import { hotmartCheckoutLinks, planIdFromHotmartAmount, planIdFromHotmartPurchase } from "./hotmart.ts";

test("R$ 29,90 ativa o plano mensal", () => expect(planIdFromHotmartAmount(29.9)).toBe("pontotech_monthly"));
test("R$ 69,90 ativa o plano trimestral", () => expect(planIdFromHotmartAmount(69.9)).toBe("pontotech_quarterly"));
test("R$ 299,90 ativa o plano anual", () => expect(planIdFromHotmartAmount(299.9)).toBe("pontotech_yearly"));
test("valor diferente não ativa plano", () => expect(planIdFromHotmartAmount(49.9)).toBeNull());
test("checkout mensal usa a oferta de R$ 29,90", () => expect(hotmartCheckoutLinks.pontotech_monthly).toBe("https://pay.hotmart.com/W108179804M?off=m9mvnjhc"));
test("checkout trimestral usa a oferta de R$ 69,90", () => expect(hotmartCheckoutLinks.pontotech_quarterly).toBe("https://pay.hotmart.com/W108179804M?off=qo10u1si"));
test("checkout anual usa a oferta de R$ 299,90", () => expect(hotmartCheckoutLinks.pontotech_yearly).toBe("https://pay.hotmart.com/W108179804M?off=m8p4t7ri"));

test("oferta mensal mantém ciclo com valor convertido", () => expect(planIdFromHotmartPurchase({ offer: { code: "m9mvnjhc" }, full_price: { value: 5.9, currency_value: "USD" } })).toBe("pontotech_monthly"));
test("oferta trimestral identifica o ciclo independentemente de taxas", () => expect(planIdFromHotmartPurchase({ offer: { code: "qo10u1si" }, full_price: { value: 75.9 } })).toBe("pontotech_quarterly"));
test("oferta anual identifica o ciclo", () => expect(planIdFromHotmartPurchase({ offer: { code: "m8p4t7ri" } })).toBe("pontotech_yearly"));
test("preço BRL reconhecido não é ocultado por full_price diferente", () => expect(planIdFromHotmartPurchase({ price: { value: 29.9, currency_value: "BRL" }, full_price: { value: 5.9, currency_value: "USD" } })).toBe("pontotech_monthly"));
test("não interpreta moeda estrangeira como reais", () => expect(planIdFromHotmartPurchase({ price: { value: 29.9, currency_value: "USD" } })).toBeNull());
test("oferta e valor desconhecidos não liberam assinatura", () => expect(planIdFromHotmartPurchase({ offer: { code: "desconhecida" }, price: { value: 49.9 } })).toBeNull());
