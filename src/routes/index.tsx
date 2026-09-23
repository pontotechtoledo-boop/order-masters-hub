import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell, Boxes, Building2, CalendarDays, Check, ChevronDown, CircleDollarSign,
  ClipboardList, Clock3, FileCheck2, Gauge, Headphones, LayoutDashboard, Menu,
  MoreHorizontal, PackageSearch, Plus, Search, Settings, ShieldCheck, Sparkles,
  TrendingUp, Users, Wrench, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "PontoTech Toledo | Gestão de assistência técnica" },
    { name: "description", content: "Gestão de ordens de serviço, garantias, estoque e financeiro para assistências técnicas." },
    { property: "og:title", content: "PontoTech Toledo" },
    { property: "og:description", content: "Operação completa para assistências técnicas." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type Section = "Visão geral" | "Ordens de serviço" | "Clientes" | "Garantias" | "Estoque" | "Financeiro" | "Equipe" | "Administração";
type Order = { id: string; client: string; device: string; stage: string; tech: string; total: string; due: string; tone: string };

const orders: Order[] = [
  { id: "OS-1048", client: "Mariana Costa", device: "iPhone 14 Pro", stage: "Em reparo", tech: "Carlos", total: "R$ 780,00", due: "Hoje, 16:00", tone: "blue" },
  { id: "OS-1047", client: "Oficina Paraná", device: "Notebook Dell G15", stage: "Aguardando aprovação", tech: "Ana", total: "R$ 460,00", due: "Hoje, 18:00", tone: "amber" },
  { id: "OS-1046", client: "João Mendes", device: "Galaxy S23", stage: "Pronto para entrega", tech: "Rafael", total: "R$ 320,00", due: "Ontem", tone: "green" },
  { id: "OS-1045", client: "Clínica Vital", device: "MacBook Air M2", stage: "Diagnóstico", tech: "Carlos", total: "—", due: "Amanhã", tone: "violet" },
  { id: "OS-1044", client: "Fernanda Lima", device: "Moto Edge 40", stage: "Aguardando peça", tech: "Ana", total: "R$ 290,00", due: "25 set", tone: "rose" },
];

const nav: { label: Section; icon: typeof Gauge; group?: string }[] = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Ordens de serviço", icon: ClipboardList, group: "OPERAÇÃO" },
  { label: "Clientes", icon: Users },
  { label: "Garantias", icon: ShieldCheck },
  { label: "Estoque", icon: Boxes, group: "GESTÃO" },
  { label: "Financeiro", icon: CircleDollarSign },
  { label: "Equipe", icon: Wrench },
  { label: "Administração", icon: Building2, group: "PLATAFORMA" },
];

const stages = [
  { label: "Recebidas", count: 6, color: "bg-status-slate" },
  { label: "Diagnóstico", count: 8, color: "bg-status-violet" },
  { label: "Aguard. aprovação", count: 5, color: "bg-status-amber" },
  { label: "Em reparo", count: 12, color: "bg-status-blue" },
  { label: "Prontas", count: 4, color: "bg-status-green" },
];

function Index() {
  const [section, setSection] = useState<Section>("Visão geral");
  const [menuOpen, setMenuOpen] = useState(false);
  const [newOrder, setNewOrder] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => orders.filter((o) => Object.values(o).join(" ").toLowerCase().includes(search.toLowerCase())), [search]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar section={section} setSection={(s) => { setSection(s); setMenuOpen(false); }} open={menuOpen} close={() => setMenuOpen(false)} />
      <main className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-7">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu /></Button>
          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ordem, cliente ou equipamento…" className="h-10 border-0 bg-muted pl-10 shadow-none" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notificações" className="relative"><Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" /></Button>
            <div className="hidden h-8 w-px bg-border sm:block" />
            <button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted" aria-label="Menu da conta">
              <span className="grid size-8 place-items-center rounded-md bg-primary font-bold text-primary-foreground">PT</span>
              <span className="hidden text-left sm:block"><span className="block text-sm font-semibold leading-4">PontoTech Toledo</span><span className="text-xs text-muted-foreground">Plano Profissional</span></span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-7 md:py-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="mb-1 text-sm font-medium text-muted-foreground">Terça-feira, 22 de setembro</p><h1 className="text-2xl font-bold md:text-3xl">{section}</h1><p className="mt-1 text-sm text-muted-foreground">Olá, Paulo. Sua operação está sob controle.</p></div>
            <Button className="h-10 w-full sm:w-auto" onClick={() => setNewOrder(true)}><Plus />Nova ordem</Button>
          </div>

          {section === "Visão geral" ? <Dashboard orders={filtered} onNew={() => setNewOrder(true)} /> : <ModuleView section={section} orders={filtered} onNew={() => setNewOrder(true)} />}
        </div>
      </main>
      <NewOrderDialog open={newOrder} onOpenChange={setNewOrder} />
    </div>
  );
}

function Sidebar({ section, setSection, open, close }: { section: Section; setSection: (s: Section) => void; open: boolean; close: () => void }) {
  return <>
    {open && <button className="fixed inset-0 z-40 bg-foreground/30 lg:hidden" onClick={close} aria-label="Fechar menu" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 items-center border-b px-5"><div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-5" /></div><div className="ml-3"><div className="text-base font-extrabold leading-4">PontoTech</div><div className="text-[10px] font-bold uppercase text-primary">Gestão inteligente</div></div><Button variant="ghost" size="icon" onClick={close} className="ml-auto lg:hidden"><X /></Button></div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((item, i) => <div key={item.label}>{item.group && <p className={`mb-2 px-3 text-[10px] font-bold text-muted-foreground ${i ? "mt-6" : ""}`}>{item.group}</p>}<button onClick={() => setSection(item.label)} className={`mb-1 flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${section === item.label ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}><item.icon className="size-[18px]" />{item.label}{item.label === "Ordens de serviço" && <span className={`ml-auto rounded px-1.5 text-[10px] ${section === item.label ? "bg-primary-foreground/20" : "bg-muted"}`}>35</span>}</button></div>)}
      </nav>
      <div className="border-t p-3"><div className="rounded-md bg-muted p-3"><div className="mb-2 flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-4 text-primary" />14 dias no período teste</div><div className="h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full w-2/3 bg-primary" /></div><button className="mt-2 text-xs font-semibold text-primary">Conhecer planos</button></div><button className="mt-2 flex h-10 w-full items-center gap-3 px-3 text-sm text-muted-foreground"><Settings className="size-4" />Configurações</button></div>
    </aside>
  </>;
}

function Dashboard({ orders, onNew }: { orders: Order[]; onNew: () => void }) {
  const metrics = [
    { label: "Ordens em andamento", value: "35", note: "+8 esta semana", icon: ClipboardList, good: true },
    { label: "Aguardando aprovação", value: "5", note: "R$ 3.240 em orçamentos", icon: Clock3 },
    { label: "Receita no mês", value: "R$ 28.450", note: "+12,8% vs. agosto", icon: TrendingUp, good: true },
    { label: "Estoque baixo", value: "7", note: "3 itens críticos", icon: PackageSearch, danger: true },
  ];
  return <div className="space-y-6">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((m) => <article key={m.label} className="rounded-lg border bg-card p-5 shadow-card"><div className="flex items-start justify-between"><div className="grid size-9 place-items-center rounded-md bg-muted text-primary"><m.icon className="size-[18px]" /></div><button aria-label="Mais opções"><MoreHorizontal className="size-4 text-muted-foreground" /></button></div><p className="mt-5 text-2xl font-bold">{m.value}</p><p className="mt-1 text-sm font-medium">{m.label}</p><p className={`mt-2 text-xs ${m.danger ? "text-destructive" : m.good ? "text-success" : "text-muted-foreground"}`}>{m.note}</p></article>)}</section>
    <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
      <div className="min-w-0 rounded-lg border bg-card shadow-card"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">Ordens recentes</h2><p className="text-xs text-muted-foreground">Atualizadas em tempo real</p></div><Button variant="ghost" size="sm">Ver todas</Button></div><OrderTable orders={orders} /></div>
      <div className="rounded-lg border bg-card p-5 shadow-card"><div className="flex items-center justify-between"><div><h2 className="font-bold">Fluxo da oficina</h2><p className="text-xs text-muted-foreground">35 ordens ativas</p></div><Gauge className="size-5 text-muted-foreground" /></div><div className="mt-6 space-y-5">{stages.map((s) => <div key={s.label}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{s.label}</span><span className="font-bold">{s.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${s.color}`} style={{ width: `${Math.max(s.count * 7, 18)}%` }} /></div></div>)}</div><Button variant="outline" className="mt-7 w-full" onClick={onNew}><Plus />Adicionar ordem</Button></div>
    </section>
    <section className="grid gap-4 lg:grid-cols-3"><Activity /><Schedule /><WarrantyNotice /></section>
  </div>;
}

function OrderTable({ orders }: { orders: Order[] }) { return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="text-xs text-muted-foreground"><th className="px-5 py-3 font-medium">ORDEM</th><th className="px-3 py-3 font-medium">CLIENTE / EQUIPAMENTO</th><th className="px-3 py-3 font-medium">STATUS</th><th className="px-3 py-3 font-medium">TÉCNICO</th><th className="px-3 py-3 font-medium">VALOR</th><th className="px-5 py-3 font-medium">PREVISÃO</th></tr></thead><tbody>{orders.map((o) => <tr key={o.id} className="border-t hover:bg-muted/50"><td className="px-5 py-4 font-bold text-primary">{o.id}</td><td className="px-3 py-4"><div className="font-semibold">{o.client}</div><div className="text-xs text-muted-foreground">{o.device}</div></td><td className="px-3 py-4"><span className={`status status-${o.tone}`}><i />{o.stage}</span></td><td className="px-3 py-4">{o.tech}</td><td className="px-3 py-4 font-semibold">{o.total}</td><td className="px-5 py-4 text-muted-foreground">{o.due}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Nenhuma ordem encontrada.</div>}</div> }

function Activity() { return <article className="rounded-lg border bg-card p-5 shadow-card"><h3 className="font-bold">Atividade recente</h3><div className="mt-5 space-y-5">{[["OS-1046 finalizada", "Rafael • há 12 min", Check],["Orçamento aprovado", "OS-1047 • há 35 min", FileCheck2],["Nova cliente cadastrada", "Fernanda Lima • há 1h", Users]].map(([a,b,I]) => { const Icon=I as typeof Check; return <div className="flex gap-3" key={String(a)}><div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted"><Icon className="size-4 text-primary" /></div><div><p className="text-sm font-semibold">{String(a)}</p><p className="text-xs text-muted-foreground">{String(b)}</p></div></div>})}</div></article> }
function Schedule() { return <article className="rounded-lg border bg-card p-5 shadow-card"><div className="flex items-center justify-between"><h3 className="font-bold">Agenda de hoje</h3><CalendarDays className="size-4 text-muted-foreground" /></div><div className="mt-5 space-y-3">{[["09:30","Entrega • OS-1038"],["14:00","Retorno em garantia"],["16:00","Previsão • OS-1048"]].map(([t,d]) => <div className="flex items-center gap-4 border-l-2 border-primary pl-3" key={t}><span className="text-sm font-bold">{t}</span><span className="text-sm text-muted-foreground">{d}</span></div>)}</div></article> }
function WarrantyNotice() { return <article className="rounded-lg border bg-primary p-5 text-primary-foreground shadow-card"><div className="flex items-start justify-between"><ShieldCheck className="size-7" /><span className="rounded bg-primary-foreground/15 px-2 py-1 text-[10px] font-bold">ESTE MÊS</span></div><p className="mt-5 text-3xl font-bold">18</p><h3 className="font-semibold">garantias emitidas</h3><p className="mt-2 text-xs text-primary-foreground/70">Todas enviadas automaticamente aos clientes.</p></article> }

function ModuleView({ section, orders, onNew }: { section: Section; orders: Order[]; onNew: () => void }) {
  const map: Record<Section, { title: string; description: string; icon: typeof Users; action: string }> = {
    "Visão geral": { title:"",description:"",icon:Gauge,action:"" }, "Ordens de serviço": { title:"Controle de ordens",description:"Acompanhe cada equipamento do recebimento à entrega.",icon:ClipboardList,action:"Nova ordem" },
    "Clientes": { title:"Clientes e equipamentos",description:"Histórico completo de atendimentos e dispositivos.",icon:Users,action:"Novo cliente" }, "Garantias": { title:"Garantias emitidas",description:"Coberturas, vencimentos e retornos vinculados às ordens.",icon:ShieldCheck,action:"Emitir garantia" },
    "Estoque": { title:"Estoque de peças",description:"Saldos, reservas, custos e alertas de reposição.",icon:Boxes,action:"Nova entrada" }, "Financeiro": { title:"Controle financeiro",description:"Receitas, despesas, recebimentos e fluxo de caixa.",icon:CircleDollarSign,action:"Novo lançamento" },
    "Equipe": { title:"Equipe técnica",description:"Acompanhe acessos, funções e produtividade.",icon:Wrench,action:"Convidar usuário" }, "Administração": { title:"Administração SaaS",description:"Empresas, planos, limites e uso da plataforma.",icon:Building2,action:"Nova empresa" },
  }; const item=map[section];
  if(section==="Ordens de serviço") return <div className="rounded-lg border bg-card shadow-card"><div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">Todas as ordens</h2><p className="text-xs text-muted-foreground">35 ativas • 128 concluídas no mês</p></div><Button onClick={onNew}><Plus />Nova ordem</Button></div><OrderTable orders={orders}/></div>;
  return <div><div className="flex min-h-[430px] flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 text-center"><div className="grid size-14 place-items-center rounded-lg bg-muted text-primary"><item.icon className="size-7" /></div><h2 className="mt-5 text-xl font-bold">{item.title}</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{item.description}</p><Button className="mt-6" onClick={onNew}><Plus />{item.action}</Button></div></div>;
}

function NewOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v:boolean)=>void }) { const [saved,setSaved]=useState(false); return <Dialog open={open} onOpenChange={(v)=>{onOpenChange(v);if(!v)setSaved(false)}}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Nova ordem de serviço</DialogTitle><DialogDescription>Registre o cliente, equipamento e as condições de entrada.</DialogDescription></DialogHeader>{saved ? <div className="py-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success"><Check className="size-7" /></div><h3 className="mt-4 text-lg font-bold">Ordem OS-1049 criada</h3><p className="mt-1 text-sm text-muted-foreground">O equipamento já aparece no fluxo da oficina.</p><Button className="mt-6" onClick={()=>onOpenChange(false)}>Concluir</Button></div> : <form className="grid gap-4 py-2" onSubmit={(e)=>{e.preventDefault();setSaved(true)}}><div className="grid gap-4 sm:grid-cols-2"><Field label="Cliente" placeholder="Nome ou documento"/><Field label="Telefone" placeholder="(45) 99999-9999"/><Field label="Equipamento" placeholder="Ex.: Smartphone"/><Field label="Marca e modelo" placeholder="Ex.: Apple iPhone 14"/></div><Field label="Defeito relatado" placeholder="Descreva o problema informado pelo cliente"/><div className="grid gap-4 sm:grid-cols-2"><Field label="Prioridade" placeholder="Normal"/><Field label="Previsão" placeholder="dd/mm/aaaa"/></div><div className="mt-2 flex justify-end gap-2"><Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button><Button type="submit"><ClipboardList />Criar ordem</Button></div></form>}</DialogContent></Dialog> }
function Field({label,placeholder}:{label:string;placeholder:string}) { return <label className="grid gap-1.5 text-sm font-semibold">{label}<Input required placeholder={placeholder} className="font-normal"/></label> }