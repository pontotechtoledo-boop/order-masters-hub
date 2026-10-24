import { expect, test } from "bun:test";
import { planIdFromHotmartAmount } from "./hotmart.ts";

test("R$ 29,90 ativa o plano mensal", () => expect(planIdFromHotmartAmount(29.9)).toBe("pontotech_monthly"));
test("R$ 69,90 ativa o plano trimestral", () => expect(planIdFromHotmartAmount(69.9)).toBe("pontotech_quarterly"));
test("R$ 299,90 ativa o plano anual", () => expect(planIdFromHotmartAmount(299.9)).toBe("pontotech_yearly"));
test("valor diferente não ativa plano", () => expect(planIdFromHotmartAmount(49.9)).toBeNull());
