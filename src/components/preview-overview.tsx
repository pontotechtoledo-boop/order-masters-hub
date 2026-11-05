import { LockKeyhole, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { systemNavigation } from './system-sidebar';

export function PreviewOverview({onSubscribe}:{onSubscribe:()=>void}) {
  return <div className="space-y-6">
    <section className="border-y border-primary/20 bg-accent px-4 py-5 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 font-semibold"><LockKeyhole className="size-4 text-primary"/>Sua próxima OS pode começar aqui.</p><p className="mt-2 text-sm text-muted-foreground">Para utilizar o sistema, escolha sua assinatura.</p></div><Button onClick={onSubscribe}>Assinar com Stripe</Button></div></section>
    <section className="bg-primary p-6 text-primary-foreground"><p className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="size-4"/>Visão geral da sua assistência</p><h2 className="mt-3 font-display text-2xl font-bold">Cada atendimento. Cada peça. Cada resultado.</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{['Assistência técnica','Produtos da loja','Despesas'].map(label=><div key={label} className="border-t border-primary-foreground/30 pt-4"><p className="text-sm">{label}</p><p className="mt-2 text-2xl font-bold">R$ 0,00</p></div>)}</div></section>
    <section><h2 className="font-display text-lg font-bold">Áreas do sistema</h2><div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">{systemNavigation.filter(item=>!['Visão geral','Assinatura','Administração'].includes(item.label)).map(item=><Button key={item.label} variant="outline" onClick={onSubscribe} className="h-28 flex-col items-start justify-between whitespace-normal p-4 text-left"><span className="flex w-full justify-between"><item.icon className="size-5 text-primary"/><LockKeyhole className="size-3 text-muted-foreground"/></span><span className="text-xs font-semibold">{item.label}</span></Button>)}</div></section>
  </div>;
}