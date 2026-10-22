import { useEffect, useState } from 'react';
import { Download, MessageCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { whatsappLink } from '@/lib/document-sharing';
import { createDocumentPdf } from '@/lib/document-pdf';

type Props = {
  active: boolean; title: string; body: string;
  company: Parameters<typeof createDocumentPdf>[2];
  phone?: string; message: string; disabled?: boolean;
  onPrepared?: () => Promise<boolean | void> | void;
};

export function DocumentWhatsAppPanel({ active, title, body, company, phone, message, disabled, onPrepared }: Props) {
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [canShare, setCanShare] = useState(false);
  useEffect(() => { setFile(undefined); setError(''); setNotice(''); setCanShare(false); }, [active, title, body, company.name, company.document, company.phone, company.address, company.email, company.logoUrl]);
  const download = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    setNotice('PDF baixado. O aviso abre a conversa do cliente; anexe o PDF no WhatsApp.');
  };
  return <section className="min-w-0 space-y-3 border-t pt-4">
    <h3 className="font-bold">WhatsApp do cliente</h3>
    <p className="break-words text-sm text-muted-foreground">{phone || 'Telefone não cadastrado'}</p>
    <div className="whitespace-pre-wrap break-words rounded-md border bg-muted p-3 text-sm">{message}</div>
    {!file ? <Button className="w-full sm:w-auto" variant="outline" disabled={disabled || busy} onClick={async () => {
      setBusy(true); setError('');
      try {
        const generated = await createDocumentPdf(title, body, company);
        if (await onPrepared?.() === false) throw new Error('Não foi possível emitir a OS. Tente novamente.');
        setFile(generated); setCanShare(Boolean(navigator.canShare?.({ files: [generated] })));
      } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível gerar o PDF.'); }
      finally { setBusy(false); }
    }}><FileDown/>{busy ? 'Preparando PDF…' : 'Preparar PDF e aviso'}</Button> : <div className="flex flex-wrap gap-2">
      <Button onClick={async () => {
        setError('');
        if (canShare) {
          try { await navigator.share({ files: [file], text: message, title }); setNotice('Escolha o WhatsApp e confirme o cliente para enviar o PDF com o aviso.'); return; }
          catch (e) { if (e instanceof Error && e.name === 'AbortError') return; }
        }
        try {
          const link = whatsappLink(phone, message);
          download();
          window.open(link, '_blank', 'noopener,noreferrer');
          setNotice('PDF baixado e conversa aberta com o aviso. Anexe o PDF no WhatsApp e confirme o envio.');
        } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível abrir o WhatsApp.'); }
      }}><MessageCircle/>Enviar PDF e aviso no WhatsApp</Button>
      <Button variant="outline" onClick={download}><Download/>Só baixar PDF</Button>
    </div>}
    {file && <p className="break-words text-xs text-muted-foreground">{file.name} · Ao compartilhar, selecione WhatsApp e confirme o cliente.</p>}
    {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}