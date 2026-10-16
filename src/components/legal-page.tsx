import type { ReactNode } from "react";

// Substituir pelos dados oficiais da empresa assim que forem enviados.
export const SELLER = {
  legalName: "[RAZÃO SOCIAL DA EMPRESA]",
  tradeName: "Service Pro OS",
  document: "[CNPJ/CPF]",
  address: "[ENDEREÇO COMPLETO]",
  email: "pontotechtoledo@gmail.com",
};

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="min-h-screen bg-background px-5 py-10 text-foreground">
    <article className="mx-auto max-w-3xl space-y-4 text-sm leading-7 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
      <a href="/" className="text-xs font-semibold text-primary">← {SELLER.tradeName}</a>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="text-xs text-muted-foreground">Última atualização: 16/10/2026</p>
      {children}
      <nav className="flex gap-4 border-t pt-6 text-xs text-muted-foreground"><a href="/termos" className="underline">Termos</a><a href="/privacidade" className="underline">Privacidade</a><a href="/reembolso" className="underline">Reembolso</a></nav>
    </article>
  </main>;
}
