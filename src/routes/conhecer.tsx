import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SystemSidebar } from '@/components/system-sidebar';
import { PreviewOverview } from '@/components/preview-overview';

export const Route = createFileRoute('/conhecer')({staticData:{sitemap:true},
  head:()=>({meta:[{title:'Conheça o sistema | Service Pro OS'},{name:'description',content:'Veja as áreas do Service Pro OS sem cadastro. Escolha sua assinatura quando quiser começar.'},{property:'og:title',content:'Conheça o Service Pro OS'},{property:'og:description',content:'Visão prévia de ordens, garantias, estoque e financeiro sem informar e-mail.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),
  component:PublicPreview,
});
function PublicPreview() {
  const [open,setOpen]=useState(false),[collapsed,setCollapsed]=useState(false);
  const subscribe=()=>{window.location.href='/comprar';};
  const locked=()=>{setOpen(false);document.getElementById('preview-subscription')?.scrollIntoView({behavior:'smooth'});};
  return <div className="min-h-screen bg-background"><SystemSidebar section="Visão geral" setSection={section=>section==='Assinatura'?subscribe():locked()} open={open} close={()=>setOpen(false)} collapsed={collapsed} toggleCollapsed={()=>setCollapsed(value=>!value)} locked/>
    <main className={collapsed?'lg:pl-20':'lg:pl-64'}><header className="flex min-h-16 flex-wrap items-center gap-3 border-b bg-card px-4 py-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={()=>setOpen(true)}><Menu/></Button><span className="text-sm font-bold">Service Pro OS</span><span className="text-xs text-muted-foreground">Prévia</span><div className="flex-1"/><Button asChild variant="ghost" size="sm"><a href="/" aria-label="Voltar à página inicial"><ArrowLeft className="size-4"/><span className="hidden sm:inline">Voltar</span></a></Button><Button onClick={subscribe} size="sm">Assinar com Stripe</Button></header>
    <div id="preview-subscription" className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-7"><h1 className="font-display text-2xl font-bold">Visão geral</h1><PreviewOverview onSubscribe={subscribe}/></div></main>
  </div>;
}