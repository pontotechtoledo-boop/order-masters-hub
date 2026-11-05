import { ArrowRight, BarChart3, Check, CircleDollarSign, ClipboardList, Clock3, Monitor, Package, ShieldCheck, Smartphone, TrendingUp, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import screenVisaoGeral from "@/assets/screen-visao-geral.png";
import screenNovaOs from "@/assets/screen-nova-os.png";
import screenGarantia from "@/assets/screen-garantia.png";

export function LandingPage() {
  const goToSignup = () => { document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" }); };
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
    { id: "pontotech_monthly", name: "Mensal", price: "R$ 29,90", period: "/mês", detail: "Comece com um compromisso mensal", equivalent: "Cobrança automática a cada mês", featured: false },
    { id: "pontotech_quarterly", name: "Trimestral", price: "R$ 69,90", period: "/trimestre", detail: "O menor valor equivalente por mês", equivalent: "Equivale a R$ 23,30/mês · cobrança a cada 3 meses", featured: true },
    { id: "pontotech_yearly", name: "Anual", price: "R$ 299,90", period: "/ano", detail: "Um ano de gestão em uma assinatura", equivalent: "Menos de R$ 0,83 por dia · cobrança anual", featured: false },
  ];

  return <main className="min-h-screen overflow-x-clip bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="/planos" className="flex items-center gap-3" aria-label="Service Pro OS - início">
          <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><Wrench className="size-5" /></span>
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
          <Button onClick={goToSignup} className="gap-2">Assinar <ArrowRight className="size-4" /></Button>
        </div>
      </div>
    </header>

    <section className="sales-hero relative overflow-hidden">
      <img src={screenVisaoGeral} alt="Visão geral do Service Pro OS" className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="sales-hero-shade absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="mb-4 text-sm font-bold text-brand-highlight">NÃO DEIXE MAIS UM ATENDIMENTO SEM REGISTRO.</p>
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-brand-ink-foreground sm:text-5xl">Service Pro OS</h1>
        <p className="mt-5 max-w-xl text-xl font-semibold leading-8 text-brand-ink-foreground">Sua bancada precisa de consertos. Sua gestão, de controle.</p>
        <p className="mt-4 max-w-xl text-base leading-7 text-brand-ink-muted">Fotos na entrada, OS organizada, garantia profissional e lucro sob controle. Comece a organizar o próximo atendimento — sem esperar o próximo prejuízo.</p>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-brand-ink-foreground"><span className="inline-flex items-center gap-2"><Monitor className="size-5 shrink-0"/>Computadores</span><span aria-hidden="true">+</span><span className="inline-flex items-center gap-2"><Smartphone className="size-5 shrink-0"/>Celulares</span><span className="w-full text-brand-ink-muted">Acesse pelo navegador no desktop ou smartphone, sem instalar.</span></p>
        <p className="mt-6 text-lg font-bold text-brand-ink-foreground">Todos os recursos a partir de R$ 29,90/mês.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="h-12"><a href="/comprar">Assinar agora <ArrowRight className="size-4" /></a></Button><Button asChild size="lg" variant="outline" className="h-12 bg-card"><a href="/conhecer">Acesse e conheça o sistema <ArrowRight className="size-4" /></a></Button></div>
        <p className="mt-5 flex items-center gap-2 text-sm text-brand-ink-muted"><ShieldCheck className="size-4 text-brand-highlight"/>7 dias de garantia ou seu dinheiro de volta · Pagamento Stripe</p>
      </div>
    </section>

    <section id="acesse-e-conheca" className="border-y bg-accent py-10 sm:py-14"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase text-primary">Antes de assinar</p><h2 className="mt-2 font-display text-3xl font-bold">Acesse e conheça</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Veja a visão geral e as áreas do sistema. Sem e-mail, sem cadastro. Quando decidir começar, escolha sua assinatura.</p></div><Button asChild size="lg" className="shrink-0"><a href="/conhecer">Conhecer o sistema <ArrowRight className="size-4"/></a></Button></div></section>

    <section id="problema" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">O problema de verdade</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Você conserta bem. O que cansa é o resto.</h2><p className="mt-4 leading-7 text-muted-foreground">Aparelho trocado, peça que some, cliente dizendo que o defeito não existia, mês fechado sem saber se sobrou dinheiro. É isso que o Service Pro OS resolve.</p></div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "O caderno que se perde", problem: "Papel rasga, molha e leva junto o histórico do serviço.", solution: "Cada OS fica salva, com número, cliente, aparelho e etapa — encontre por nome, CPF ou número." },
            { title: "“Isso não estava assim”", problem: "Sem registro da entrada, é sua palavra contra a do cliente.", solution: "Checklist e até 6 fotos na abertura da OS, impressos no documento que o cliente recebe." },
            { title: "Faturou, mas cadê o lucro?", problem: "O caixa gira, mas peças e despesas comem a margem sem você ver.", solution: "Relatório com receitas, custo de peças e produtos, despesas e lucro líquido por período." },
          ].map((item) => <article key={item.title} className="rounded-lg border bg-card p-6"><h3 className="font-display text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.problem}</p><p className="mt-4 flex gap-2 text-sm font-medium leading-6"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item.solution}</p></article>)}
        </div>
      </div>
    </section>



    <section id="recursos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Recursos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Tudo conectado à rotina da sua assistência</h2><p className="mt-4 leading-7 text-muted-foreground">Menos informações perdidas em papel e conversas soltas. Cada etapa conectada ao cliente, ao aparelho e ao resultado da sua empresa.</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => <article key={feature.title} className="rounded-lg border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"><span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary"><feature.icon className="size-5" /></span><h3 className="mt-5 font-display text-lg font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p></article>)}
        </div>
      </div>
    </section>

    <section id="como-funciona" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div><p className="text-sm font-bold uppercase tracking-widest text-primary">Comece sem complicação</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Do cadastro ao controle da sua operação</h2><p className="mt-4 leading-7 text-muted-foreground">Escolha seu plano e pague com segurança pelo Stripe. Depois da confirmação, crie a senha pelo link recebido no e-mail. As renovações mantêm o mesmo acesso.</p><Button className="mt-7 gap-2" size="lg" onClick={goToSignup}>Escolher meu plano <ArrowRight className="size-4" /></Button></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[{n:"01",title:"Escolha seu plano",desc:"Informe seus dados e pague com segurança pelo Stripe."},{n:"02",title:"Crie sua senha",desc:"Após o pagamento confirmado, conclua o cadastro pelo link enviado ao e-mail."},{n:"03",title:"Organize a rotina",desc:"Use o sistema com nossa garantia de reembolso de 7 dias."}].map((step) => <div key={step.n} className="rounded-lg border bg-card p-5"><p className="font-display text-3xl font-extrabold text-primary">{step.n}</p><h3 className="mt-4 font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p></div>)}
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
          ].map((shot) => <figure key={shot.title} className="overflow-hidden rounded-lg border bg-card shadow-lg">
            <img src={shot.src} alt={shot.alt} loading="lazy" className="aspect-[8/5] w-full object-cover object-top" />
            <figcaption className="p-5"><h3 className="font-display text-lg font-bold">{shot.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{shot.desc}</p></figcaption>
          </figure>)}
        </div>
      </div>
    </section>

    <section id="planos" className="scroll-mt-24 border-y bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-widest text-primary">Planos</p><h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Todos os recursos. Você escolhe o ciclo.</h2><p className="mt-4 text-muted-foreground">Sem pegadinha: estoque, PDV, garantias e financeiro não ficam presos a um plano mais caro. Os três ciclos incluem tudo — muda só a forma de cobrança. Garantia de 7 dias.</p></div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((plan) => <article key={plan.name} className={`relative flex flex-col rounded-lg border bg-card p-6 ${plan.featured ? "border-primary shadow-xl ring-1 ring-primary/20" : ""}`}>
            {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Menor valor por mês</span>}
            <h3 className="font-display text-xl font-bold">{plan.name}</h3><p className="mt-2 text-sm text-muted-foreground">{plan.detail}</p>
            <p className="mt-6"><span className="font-display text-3xl font-extrabold">{plan.price}</span><span className="text-sm text-muted-foreground">{plan.period}</span></p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{plan.equivalent}</p><p className="mt-6 font-semibold">Incluído neste plano</p><ul className="mt-4 grid gap-3 text-sm text-muted-foreground">{included.map((benefit) => <li key={benefit} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span>{benefit}</span></li>)}</ul><div className="h-7" />
            <Button asChild variant={plan.featured ? "default" : "outline"} className="mt-auto w-full gap-2 self-end"><a href={`/comprar?plano=${plan.id}`}>Assinar {plan.name.toLowerCase()} <ArrowRight className="size-4" /></a></Button>
            
          </article>)}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Renovação automática conforme o ciclo contratado. Você pode cancelar a renovação e manter o acesso até o fim do período pago.</p>
        <div className="mx-auto mt-8 max-w-3xl border-y py-6 text-center"><ShieldCheck className="mx-auto size-7 text-primary" /><h3 className="mt-3 font-display text-xl font-bold">Nossa garantia: 7 dias ou seu dinheiro de volta</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">O Service Pro OS oferece reembolso integral em até 7 dias corridos após a compra ou renovação. A garantia é nossa; o Stripe processa o pagamento e a devolução.</p><a href="/reembolso" className="mt-3 inline-block text-sm font-semibold text-primary underline">Consultar política de reembolso</a></div>
      </div>
    </section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-3xl px-5 sm:px-8"><h2 className="font-display text-3xl font-extrabold">Antes de começar</h2><div className="mt-8 divide-y border-y">{[
      { question: "Como recebo meu acesso?", answer: "Você pode pagar primeiro e criar sua senha pelo link enviado após a confirmação. Também pode criar uma conta antes de assinar. Nas renovações, mantém o mesmo cadastro." },
      { question: "Funciona em computadores e celulares?", answer: "Sim. Acesse o Service Pro OS pelo navegador do computador ou do smartphone, sem instalar. Use a mesma conta nos dois dispositivos." },
      { question: "O que acontece se eu criar a conta sem assinar?", answer: "Você pode abrir a prévia sem informar e-mail. As abas permanecem bloqueadas; quando quiser usar, escolha sua assinatura." },
      { question: "Quando meu acesso volta após renovar?", answer: "Assim que o pagamento é confirmado, o acesso normal é restabelecido, inclusive durante ou depois dos 7 dias de tolerância. Não é necessário criar outra conta." },
      { question: "Preciso do plano anual para ter todos os recursos?", answer: "Não. Mensal, trimestral e anual incluem os mesmos recursos. Escolha o ciclo de cobrança que faz mais sentido para sua empresa." },
      { question: "Estoque e PDV custam a mais?", answer: "Não. Todos os recursos estão incluídos em qualquer ciclo: mensal, trimestral ou anual." },
      { question: "O sistema envia mensagens automaticamente no WhatsApp?", answer: "Não. Ele prepara o aviso e o PDF da OS ou da garantia. Você abre seu WhatsApp, confirma o destinatário e compartilha ou anexa o documento." },
      { question: "Posso cancelar a renovação?", answer: "Sim. Gerencie a assinatura dentro do sistema. Ao cancelar a renovação, o acesso permanece até o fim do período já pago. Para pedidos de reembolso, consulte a política de 7 dias." },
    ].map((item) => <details key={item.question} className="py-5"><summary className="cursor-pointer font-semibold">{item.question}</summary><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p></details>)}</div></div></section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><span className="mx-auto grid size-14 place-items-center rounded-lg bg-primary/10 text-primary"><Wrench className="size-7" /></span><h2 className="mt-5 font-display text-3xl font-extrabold sm:text-4xl">Pronto para organizar sua assistência?</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">Assine com 7 dias de garantia e descubra como o Service Pro OS pode simplificar sua rotina.</p><Button size="lg" className="mt-7 gap-2" onClick={goToSignup}>Assinar agora <ArrowRight className="size-4" /></Button><p className="mt-3 text-xs text-muted-foreground">Já tem conta? <a className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth">Entre aqui</a></p></div></section>

    <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><div><span className="font-display font-bold text-foreground">Service Pro OS</span><span className="ml-2">Gestão para assistência técnica</span></div><p className="flex flex-wrap gap-3"><a href="/termos" className="underline">Termos</a><a href="/privacidade" className="underline">Privacidade</a><a href="/reembolso" className="underline">Reembolso</a><span>© {new Date().getFullYear()} Service Pro OS</span></p></div></footer>
  </main>;
}

