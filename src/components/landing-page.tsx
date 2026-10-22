import { ArrowRight, BarChart3, Check, CircleDollarSign, ClipboardList, Clock3, Package, ShieldCheck, Smartphone, TrendingUp, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import screenVisaoGeral from "@/assets/screen-visao-geral.png";
import screenNovaOs from "@/assets/screen-nova-os.png";
import screenGarantia from "@/assets/screen-garantia.png";

export function LandingPage() {
  const goToSignup = () => { window.location.href = "/cadastro"; };
  const goToLogin = () => { window.location.href = "/auth"; };

  const features = [
    { icon: ClipboardList, title: "Do balcão à entrega, sem perder o histórico", description: "Registre o defeito, o checklist e as fotos do aparelho. Consulte a OS por número, nome ou CPF e acompanhe cada etapa do atendimento." },
    { icon: ShieldCheck, title: "Uma garantia ligada ao serviço realizado", description: "Emita o termo com o mesmo número da OS, defina cobertura e validade e consulte o documento quando o cliente voltar." },
    { icon: Smartphone, title: "Cliente informado pelo seu WhatsApp", description: "Prepare avisos de recebimento e finalização, baixe a OS ou a garantia em PDF e compartilhe pelo seu WhatsApp. Você confirma o envio e anexa o arquivo." },
    { icon: Check, title: "Orçamento com decisão registrada", description: "Gere um link para o cliente conferir o orçamento e aprovar ou recusar. A decisão fica registrada no atendimento." },
    { icon: Package, title: "Peças e produtos sob controle", description: "Registre entradas e saídas, acompanhe as peças usadas nas ordens e as baixas nas vendas. Consulte também os aparelhos que estão em loja." },
    { icon: CircleDollarSign, title: "Serviços, vendas e despesas no mesmo lugar", description: "Registre vendas no PDV e despesas da empresa. As receitas dos serviços finalizados se conectam ao financeiro, sem espalhar o controle em várias planilhas." },
    { icon: BarChart3, title: "Veja o resultado, não só o faturamento", description: "Filtre por data e acompanhe receitas, custos de peças e produtos, despesas e lucro líquido no relatório gerencial." },
    { icon: Users, title: "Histórico do cliente sempre à mão", description: "Centralize contatos e atendimentos. Pesquise por nome ou documento para identificar o cliente e encontrar suas ordens e garantias." },
    { icon: Wrench, title: "Documentos com a identidade da sua empresa", description: "Use os dados e o logo da sua assistência na OS e na garantia. Imprima em A4 ou em formato térmico de 80 mm e 58 mm, com fotos na OS." },
  ];

  const included = [
    "Ordens de serviço com checklist e fotos",
    "Clientes e histórico de atendimentos",
    "Garantias vinculadas à OS",
    "Orçamentos por link com aprovação ou recusa",
    "OS e garantia em PDF e impressão A4/térmica",
    "Avisos para compartilhar pelo seu WhatsApp",
    "Estoque de peças e produtos com movimentações",
    "PDV e histórico de vendas",
    "Controle de receitas e despesas",
    "Relatórios por período com lucro líquido",
    "Dados e logo da sua empresa nos documentos",
  ];

  const plans = [
    { name: "Mensal", price: "R$ 29,90", period: "/mês", detail: "Comece com um compromisso mensal", equivalent: "Cobrança automática a cada mês", featured: false },
    { name: "Trimestral", price: "R$ 69,90", period: "/trimestre", detail: "O menor valor equivalente por mês", equivalent: "Equivale a R$ 23,30/mês · cobrança a cada 3 meses", featured: true },
    { name: "Anual", price: "R$ 299,90", period: "/ano", detail: "Um ano de gestão em uma assinatura", equivalent: "Equivale a cerca de R$ 24,99/mês · cobrança anual", featured: false },
  ];

  return <main className="min-h-screen overflow-x-clip bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="/planos" className="flex items-center gap-3" aria-label="Service Pro OS - início">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Wrench className="size-5" /></span>
          <span><span className="block font-display text-lg font-extrabold leading-tight">Service Pro OS</span><span className="block text-xs text-muted-foreground">Gestão para assistência técnica</span></span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#recursos" className="text-muted-foreground transition hover:text-foreground">Recursos</a>
          <a href="#como-funciona" className="text-muted-foreground transition hover:text-foreground">Como funciona</a>
          <a href="#por-dentro" className="text-muted-foreground transition hover:text-foreground">Por dentro</a>
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
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Saia do caderno e <span className="text-primary">proteja sua bancada.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Service Pro OS organiza sua assistência técnica: checklist com fotos na entrada, orçamento aprovado pelo cliente, garantia vinculada à OS e lucro real no fim do mês. Tudo liberado a partir de R$ 29,90/mês.</p>
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

    <section id="problema" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">O problema de verdade</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Você conserta bem. O que cansa é o resto.</h2><p className="mt-4 leading-7 text-muted-foreground">Aparelho trocado, peça que some, cliente dizendo que o defeito não existia, mês fechado sem saber se sobrou dinheiro. É isso que o Service Pro OS resolve.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "O caderno que se perde", problem: "Papel rasga, molha e leva junto o histórico do serviço.", solution: "Cada OS fica salva, com número, cliente, aparelho e etapa — encontre por nome, CPF ou número." },
            { title: "“Isso não estava assim”", problem: "Sem registro da entrada, é sua palavra contra a do cliente.", solution: "Checklist e até 6 fotos na abertura da OS, impressos no documento que o cliente recebe." },
            { title: "Faturou, mas cadê o lucro?", problem: "O caixa gira, mas peças e despesas comem a margem sem você ver.", solution: "Relatório com receitas, custo de peças e produtos, despesas e lucro líquido por período." },
          ].map((item) => <article key={item.title} className="rounded-2xl border bg-card p-6"><h3 className="font-display text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.problem}</p><p className="mt-4 flex gap-2 text-sm font-medium leading-6"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item.solution}</p></article>)}
        </div>
      </div>
    </section>



    <section id="recursos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Recursos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Tudo conectado à rotina da sua assistência</h2><p className="mt-4 leading-7 text-muted-foreground">Menos informações perdidas em papel e conversas soltas. Cada etapa conectada ao cliente, ao aparelho e ao resultado da sua empresa.</p></div>
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

    <section id="por-dentro" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Por dentro do sistema</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Veja como é trabalhar com o Service Pro OS</h2><p className="mt-4 leading-7 text-muted-foreground">Telas reais do sistema: a visão geral do seu dia, a abertura de uma OS passo a passo e a emissão da garantia vinculada à ordem.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            { src: screenVisaoGeral, alt: "Tela de visão geral do Service Pro OS com faturamento do dia e acesso rápido às áreas", title: "Visão geral do seu dia", desc: "Faturamento, despesas e acesso rápido a cada área assim que você entra." },
            { src: screenNovaOs, alt: "Abertura de ordem de serviço em passos: cliente, aparelho e defeito, peças e valores", title: "Nova OS em passos guiados", desc: "Cliente, aparelho com checklist e fotos, peças e valores — sem se perder no caminho." },
            { src: screenGarantia, alt: "Emissão de garantia vinculada ao número da ordem de serviço", title: "Garantia ligada à OS", desc: "O número da garantia acompanha a ordem e o certificado sai pronto para imprimir ou enviar." },
          ].map((shot) => <figure key={shot.title} className="overflow-hidden rounded-2xl border bg-card shadow-lg">
            <img src={shot.src} alt={shot.alt} loading="lazy" className="aspect-[8/5] w-full object-cover object-top" />
            <figcaption className="p-5"><h3 className="font-display text-lg font-bold">{shot.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{shot.desc}</p></figcaption>
          </figure>)}
        </div>
      </div>
    </section>

    <section id="planos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Planos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Todos os recursos. Você escolhe o ciclo.</h2><p className="mt-4 text-muted-foreground">Teste por 3 dias grátis. Os três planos incluem os mesmos recursos para sua empresa; o que muda é o período de cobrança.</p></div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((plan) => <article key={plan.name} className={`relative flex flex-col rounded-2xl border bg-card p-6 ${plan.featured ? "border-primary shadow-xl ring-1 ring-primary/20" : ""}`}>
            {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Menor valor por mês</span>}
            <h3 className="font-display text-xl font-bold">{plan.name}</h3><p className="mt-2 text-sm text-muted-foreground">{plan.detail}</p>
            <p className="mt-6"><span className="font-display text-3xl font-extrabold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{plan.equivalent}</p><p className="mt-6 font-semibold">Incluído neste plano</p><ul className="mt-4 grid gap-3 text-sm text-muted-foreground">{included.map((benefit) => <li key={benefit} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span>{benefit}</span></li>)}</ul><div className="h-7" />
            <Button variant={plan.featured ? "default" : "outline"} className="mt-auto w-full gap-2 self-end" onClick={goToSignup}>Começar teste grátis <ArrowRight className="size-4" /></Button>
          </article>)}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Renovação automática conforme o ciclo contratado. Você pode cancelar a renovação e manter o acesso até o fim do período pago. Consulte os termos e a política de reembolso de 14 dias.</p>
      </div>
    </section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-3xl px-5 sm:px-8"><h2 className="font-display text-3xl font-extrabold">Antes de começar</h2><div className="mt-8 divide-y border-y">{[
      { question: "O que acontece depois dos 3 dias grátis?", answer: "Para continuar usando após o teste, escolha uma assinatura mensal, trimestral ou anual. O acesso é liberado quando o pagamento é confirmado." },
      { question: "Preciso do plano anual para ter todos os recursos?", answer: "Não. Mensal, trimestral e anual incluem os mesmos recursos. Escolha o ciclo de cobrança que faz mais sentido para sua empresa." },
      { question: "O sistema envia mensagens automaticamente no WhatsApp?", answer: "Não. Ele prepara o aviso e o PDF da OS ou da garantia. Você abre seu WhatsApp, confirma o destinatário e compartilha ou anexa o documento." },
      { question: "Posso cancelar a renovação?", answer: "Sim. Gerencie a assinatura dentro do sistema. Ao cancelar a renovação, o acesso permanece até o fim do período já pago. Para pedidos de reembolso, consulte a política de 14 dias." },
    ].map((item) => <details key={item.question} className="py-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p></details>)}</div></div></section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Wrench className="size-7" /></span><h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">Pronto para organizar sua assistência?</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Comece com 3 dias grátis e descubra como o Service Pro OS pode simplificar sua rotina.</p><Button size="lg" className="mt-7 gap-2" onClick={goToSignup}>Iniciar teste grátis <ArrowRight className="size-4" /></Button><p className="mt-3 text-xs text-muted-foreground">Já tem conta? <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={goToLogin}>Entre aqui</button></p></div></section>

    <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><span className="font-display font-bold text-foreground">Service Pro OS</span><span className="ml-2">Gestão para assistência técnica</span></div><p className="flex flex-wrap gap-3"><a href="/termos" className="underline">Termos</a><a href="/privacidade" className="underline">Privacidade</a><a href="/reembolso" className="underline">Reembolso</a><span>© {new Date().getFullYear()} Service Pro OS</span></p></div></footer>
  </main>;
}

