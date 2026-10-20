const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return <div className="border-b border-destructive/30 bg-destructive/5 px-4 py-2 text-center text-xs font-semibold text-destructive">Os pagamentos ainda estão em fase de liberação. Em breve a contratação estará disponível.</div>;
  }
  if (clientToken.startsWith("pk_test_")) {
    return <div className="border-b border-warning/30 bg-warning-soft px-4 py-2 text-center text-xs font-semibold text-warning">Ambiente de teste — nenhuma cobrança será realizada.</div>;
  }
  return null;
}
