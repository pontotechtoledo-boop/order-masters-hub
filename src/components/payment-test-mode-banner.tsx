import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;
  return <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">Ambiente de teste — nenhuma cobrança será realizada.</div>;
}