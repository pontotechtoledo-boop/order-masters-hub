import { expect, test } from "bun:test";
import { hotmartCheckoutLinks, planIdFromHotmartAmount } from "./hotmart.ts";

test("R$ 29,90 ativa o plano mensal", () => expect(planIdFromHotmartAmount(29.9)).toBe("pontotech_monthly"));
test("R$ 69,90 ativa o plano trimestral", () => expect(planIdFromHotmartAmount(69.9)).toBe("pontotech_quarterly"));
test("R$ 299,90 ativa o plano anual", () => expect(planIdFromHotmartAmount(299.9)).toBe("pontotech_yearly"));
test("valor diferente não ativa plano", () => expect(planIdFromHotmartAmount(49.9)).toBeNull());
test("checkout mensal usa a oferta de R$ 29,90", () => expect(hotmartCheckoutLinks.pontotech_monthly).toBe("https://pay.hotmart.com/W108179804M?off=m9mvnjhc"));
test("checkout trimestral usa a oferta de R$ 69,90", () => expect(hotmartCheckoutLinks.pontotech_quarterly).toBe("https://pay.hotmart.com/W108179804M?off=qo10u1si"));
test("checkout anual usa a oferta de R$ 299,90", () => expect(hotmartCheckoutLinks.pontotech_yearly).toBe("https://pay.hotmart.com/W108179804M?off=m8p4t7ri"));
