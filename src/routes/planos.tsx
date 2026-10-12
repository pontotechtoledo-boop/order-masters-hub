import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Check, CircleDollarSign, ClipboardList, Clock3, Package, ShieldCheck, Smartphone, TrendingUp, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/planos")({
  head: () => ({ meta: [
    { title: "Service Pro OS | Gestão completa para assistência técnica" },
    { name: "description", content: "Organize ordens de serviço, clientes, estoque, garantias e financeiro em um só lugar. Experimente o Service Pro OS grátis por 3 dias." },
    { property: "og:title", content: "Service Pro OS" },
    { property: "og:description", content: "Menos improviso, mais controle para sua assistência técnica. Comece com 3 dias grátis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});

function LandingPage() {
  const goToSignup = () => { window.location.href = "/cadastro"; };
  const goToLogin = () => { window.location.href = "/auth"; };

  const features = [
    { icon: ClipboardList, title: "Ordens de serviço", description: "Acompanhe cada aparelho, do recebimento à entrega, com histórico organizado." },
    { icon: Package, title: "Estoque sob controle", description: "Registre peças, produtos, entradas, saídas e movimentações." },
    { icon: CircleDollarSign, title: "Financeiro e vendas", description: "Visualize vendas, despesas e movimentações para entender melhor os resultados." },
    { icon: ShieldCheck, title: "Garantias organizadas", description: "Emita garantias vinculadas às ordens e consulte o histórico quando precisar." },
    { icon: Users, title: "Clientes centralizados", description: "Mantenha contatos e atendimentos em um só lugar." },
    { icon: BarChart3, title: "Visão do negócio", description: "Consulte indicadores e relatórios para acompanhar a operação." },
  ];

  const plans = [
    { name: "Mensal", price: "R$ 29,90", period: "/mês", detail: "Flexibilidade para começar", featured: false },
    { name: "Trimestral", price: "R$ 69,90", period: "/trimestre", detail: "Pague a cada 3 meses", featured: false },
    { name: "Anual", price: "R$ 299,90", period: "/ano", detail: "Melhor custo no longo prazo", featured: true },
  ];

  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="/planos" className="flex items-center gap-3" aria-label="Service Pro OS - início">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Wrench className="size-5" /></span>
          <span><span className="block font-display text-lg font-extrabold leading-tight">Service Pro OS</span><span className="block text-xs text-muted-foreground">Gestão para assistência técnica</span></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#recursos" className="text-muted-foreground transition hover:text-foreground">Recursos</a>
          <a href="#como-funciona" className="text-muted-foreground transition hover:text-foreground">Como funciona</a>
          <a href="#planos" className="text-muted-foreground transition hover:text-foreground">Planos</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex" onClick={goToLogin}>Entrar</Button>
          <Button onClick={goToSignup} className="gap-2">Testar grátis <ArrowRight className="size-4" /></Button>
        </div>
      </div>
    </header>

    <section className="relative">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.13),transparent_48%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary"><Clock3 className="size-4" /> 3 dias grátis para experimentar</div>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Sua assistência técnica merece <span className="text-primary">mais controle.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Organize ordens de serviço, clientes, estoque, garantias e financeiro em um único sistema. Menos planilhas e retrabalho. Mais clareza para cuidar do seu negócio.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="h-12 gap-2 px-6 shadow-brand" onClick={goToSignup}>Começar teste grátis <ArrowRight className="size-4" /></Button>
            <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })}>Conhecer recursos</Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Cadastro simples</span>
            <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Histórico organizado</span>
            <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Acesso online</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-2xl" />
          <div className="relative rounded-2xl border bg-card p-4 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Painel de controle</p><h2 className="mt-1 font-display text-xl font-bold">Sua operação em um só lugar</h2></div>
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><TrendingUp className="size-5" /></span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[{label:"Ordens de serviço",icon:ClipboardList},{label:"Clientes",icon:Users},{label:"Estoque",icon:Package},{label:"Financeiro",icon:BarChart3},{label:"Garantias",icon:ShieldCheck},{label:"Atendimento",icon:Smartphone}].map((item) => <div key={item.label} className="rounded-xl border bg-background p-4"><item.icon className="size-5 text-primary" /><p className="mt-4 text-sm font-semibold">{item.label}</p><p className="mt-1 text-xs text-muted-foreground">Tudo organizado</p></div>)}
            </div>
            <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground"><p className="text-sm font-semibold">Mais organização para sua rotina</p><p className="mt-1 text-sm opacity-85">Acompanhe as informações importantes sem espalhar dados por vários lugares.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section id="recursos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Recursos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Tudo conectado à rotina da sua assistência</h2><p className="mt-4 leading-7 text-muted-foreground">Ferramentas para acompanhar o serviço e administrar o negócio com mais tranquilidade.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => <article key={feature.title} className="rounded-2xl border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><feature.icon className="size-5" /></span><h3 className="mt-5 font-display text-lg font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p></article>)}
        </div>
      </div>
    </section>

    <section id="como-funciona" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Comece sem complicação</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Do cadastro ao controle da sua operação</h2><p className="mt-4 leading-7 text-muted-foreground">Crie sua conta, cadastre sua empresa e explore os recursos do sistema durante o período de teste.</p><Button className="mt-7 gap-2" size="lg" onClick={goToSignup}>Criar minha conta grátis <ArrowRight className="size-4" /></Button></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[{n:"01",title:"Crie sua conta",desc:"Informe seus dados e o nome da empresa."},{n:"02",title:"Organize a rotina",desc:"Conheça os módulos e configure sua operação."},{n:"03",title:"Escolha seu plano",desc:"Continue usando após o teste grátis."}].map((step) => <div key={step.n} className="rounded-2xl border bg-card p-5"><p className="font-display text-3xl font-extrabold text-primary">{step.n}</p><h3 className="mt-4 font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p></div>)}
          </div>
        </div>
      </div>
    </section>

    <section id="planos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Planos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Escolha como continuar</h2><p className="mt-4 text-muted-foreground">Experimente por 3 dias grátis e escolha o ciclo ideal para sua empresa.</p></div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((plan) => <article key={plan.name} className={`relative flex flex-col rounded-2xl border bg-card p-6 ${plan.featured ? "border-primary shadow-xl ring-1 ring-primary/20" : ""}`}>
            {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Melhor custo-benefício</span>}
            <h3 className="font-display text-xl font-bold">{plan.name}</h3><p className="mt-2 text-sm text-muted-foreground">{plan.detail}</p>
            <p className="mt-6"><span className="font-display text-3xl font-extrabold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></p>
            <ul className="mt-6 grid gap-3 text-sm text-muted-foreground"><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" /> Acesso ao sistema</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" /> Módulos de gestão</li><li className="flex gap-2"><Check className="size-4 shrink-0 text-primary" /> Histórico e relatórios</li></ul>
            <Button variant={plan.featured ? "default" : "outline"} className="mt-7 w-full gap-2" onClick={goToSignup}>Começar teste grátis <ArrowRight className="size-4" /></Button>
          </article>)}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Os valores e a contratação serão confirmados na etapa de assinatura.</p>
      </div>
    </section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Wrench className="size-7" /></span><h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">Pronto para organizar sua assistência?</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Comece com 3 dias grátis e descubra como o Service Pro OS pode simplificar sua rotina.</p><Button size="lg" className="mt-7 gap-2" onClick={goToSignup}>Iniciar teste grátis <ArrowRight className="size-4" /></Button><p className="mt-3 text-xs text-muted-foreground">Já tem conta? <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={goToLogin}>Entre aqui</button></p></div></section>

    <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><span className="font-display font-bold text-foreground">Service Pro OS</span><span className="ml-2">Gestão para assistência técnica</span></div><p>© {new Date().getFullYear()} Service Pro OS. Todos os direitos reservados.</p></div></footer>
  </main>;
}

