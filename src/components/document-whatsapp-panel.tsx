import { useEffect, useState } from 'react';
import { Download, MessageCircle, Share2, FileDown } from 'lucide-react';
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
  useEffect(() => { setFile(undefined); setError(''); setNotice(''); setCanShare(false); }, [active, title]);
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
      {canShare && <Button onClick={async () => {
        setError('');
        try { await navigator.share({ files: [file], text: message, title }); setNotice('Compartilhamento aberto. O envio é confirmado no aplicativo escolhido.'); }
        catch (e) { if (e instanceof Error && e.name !== 'AbortError') setError('Não foi possível compartilhar. Baixe o PDF e anexe no WhatsApp.'); }
      }}><Share2/>Compartilhar PDF e aviso</Button>}
      <Button variant="outline" onClick={download}><Download/>Baixar PDF</Button>
      <Button variant="outline" onClick={() => {
        try {
          const popup = window.open(whatsappLink(phone, message), '_blank', 'noopener,noreferrer');
          setNotice('Conversa do cliente aberta com o aviso. O PDF deve ser anexado no WhatsApp; o envio não é automático.');
        } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível abrir o WhatsApp.'); }
      }}><MessageCircle/>Enviar aviso</Button>
    </div>}
    {file && <p className="break-words text-xs text-muted-foreground">{file.name} · Ao compartilhar, selecione WhatsApp e confirme o cliente.</p>}
    {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}