import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import { createQuote } from '@/utils/quotes.functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Send } from 'lucide-react';

export function OrderQuotePanel({ orderId, onCreated }: { orderId: string; onCreated: () => void }) {
  const create = useServerFn(createQuote);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    supabase.from('order_quotes').select('token,status').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
      setToken(data?.token ?? ''); setStatus(data?.status ?? '');
    });
  }, [orderId]);
  const url = token && typeof window !== 'undefined' ? `${window.location.origin}/orcamento/${token}` : '';
  return <section className="space-y-3 border-t pt-4">
    <h3 className="font-bold">Orçamento e aprovação</h3>
    {status && <p className="text-sm text-muted-foreground">{({ pending: 'Aguardando aprovação', approved: 'Aprovado pelo cliente', rejected: 'Recusado pelo cliente', revoked: 'Link substituído' } as Record<string,string>)[status]}</p>}
    {url && <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2"><Input aria-label="Link do orçamento" readOnly value={url}/><Button variant="outline" size="icon" title="Copiar link" onClick={async () => { try { await navigator.clipboard.writeText(url); setError('Link copiado.'); } catch { setError('Selecione e copie o link acima.'); } }}><Copy/></Button></div>}
    <Button disabled={busy} variant="outline" onClick={async () => {
      setBusy(true); setError('');
      try { const quote = await create({ data: { orderId } }); setToken(quote.token); setStatus(quote.status); onCreated(); }
      catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível gerar o orçamento.'); }
      finally { setBusy(false); }
    }}><Send/>{busy ? 'Gerando…' : token ? 'Gerar novo link' : 'Gerar link de orçamento'}</Button>
    {error && <p role="status" className="text-sm text-muted-foreground">{error}</p>}
  </section>;
}