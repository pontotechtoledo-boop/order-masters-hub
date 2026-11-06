import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmailSupport() {
  return <Button asChild size="icon" className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-brand" title="Suporte por e-mail" aria-label="Entrar em contato com o suporte por e-mail">
    <a href="mailto:pontotechtoledo@gmail.com?subject=Suporte%20Service%20Pro%20OS"><Mail className="size-5" /><span className="sr-only">Suporte por e-mail</span></a>
  </Button>;
}