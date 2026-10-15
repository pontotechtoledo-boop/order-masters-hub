import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { publicQuote } from '@/utils/quotes.functions';
import { Button } from '@/components/ui/button';
import { Check, X, Wrench } from 'lucide-react';

export const Route = createFileRoute('/orcamento/$token')({
  loader: ({ params }) => publicQuote({ data: { token: params.token } }),
  head: () => ({ meta: [
    { title: 'Orçamento de serviço | PontoTech Toledo' },
    { name: 'description', content: 'Consulte e responda ao orçamento da sua assistência técnica.' },
    { property: 'og:title', content: 'Orçamento de serviço | PontoTech Toledo' },
    { property: 'og:description', content: 'Consulte e responda ao orçamento da sua assistência técnica.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex, nofollow' },
  ] }),
  component: QuotePage,
  errorComponent: () => <main className="mx-auto max-w-xl p-6"><h1 className="text-xl font-bold">Orçamento indisponível</h1><p className="mt-3 text-muted-foreground">Solicite um novo link à assistência.</p></main>,
});

function QuotePage() {
  const initial = Route.useLoaderData();
  const { token } = Route.useParams();
  const [quote, setQuote] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const decide = useServerFn(publicQuote);
  const pending = quote.status === 'pending' && Date.parse(quote.expiresAt) > Date.now();
  async function answer(decision: 'approved' | 'rejected') {
    if (!window.confirm(decision === 'approved' ? 'Confirmar aprovação deste orçamento?' : 'Confirmar recusa deste orçamento?')) return;
    setBusy(true); setError('');
    try { setQuote(await decide({ data: { token, decision } })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível registrar sua resposta.'); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-xl space-y-6 px-5 py-10">
    <Wrench className="size-9 text-primary"/><h1 className="break-words text-2xl font-bold">{quote.company}</h1>
    <section className="space-y-4 border-y py-6"><h2 className="text-lg font-bold">Orçamento · OS-{quote.number}</h2><p className="font-semibold">{quote.device}</p><p className="whitespace-pre-wrap break-words">{quote.description}</p><p className="text-3xl font-bold">{Number(quote.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-sm text-muted-foreground">Válido até {new Date(quote.expiresAt).toLocaleDateString('pt-BR')}</p></section>
    {pending ? <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => answer('approved')}><Check/>Aprovar orçamento</Button><Button variant="outline" disabled={busy} onClick={() => answer('rejected')}><X/>Recusar</Button></div> : <p role="status" className="font-bold">{quote.status === 'approved' ? 'Orçamento aprovado' : quote.status === 'rejected' ? 'Orçamento recusado' : 'Orçamento expirado'}</p>}
    {quote.decidedAt && <p className="text-sm text-muted-foreground">Resposta registrada em {new Date(quote.decidedAt).toLocaleString('pt-BR')}</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </main>;
}