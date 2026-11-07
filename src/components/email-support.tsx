import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmailSupport() {
  return <Button asChild className="fixed bottom-4 right-4 z-40 h-11 rounded-full px-4 shadow-brand" title="Suporte por e-mail" aria-label="Entrar em contato com o suporte por e-mail">
    <a href="mailto:pontotechtoledo@gmail.com?subject=Suporte%20Service%20Pro%20OS" className="flex items-center gap-2"><Mail className="size-4" /><span className="text-sm font-semibold">Suporte</span><span className="grid size-4 place-items-center rounded-full border border-current/40 text-[10px] leading-none opacity-70">?</span></a>
  </Button>;
}
