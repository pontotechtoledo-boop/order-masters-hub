import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserPlus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar | Service Pro OS" },
    { name: "description", content: "Acesse o sistema de gestão da sua assistência técnica." },
    { property: "og:title", content: "Entrar no Service Pro OS" },
    { property: "og:description", content: "Acesse ordens, clientes, estoque e garantias da sua empresa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [identifier,setIdentifier]=useState(""),[password,setPassword]=useState(""),[show,setShow]=useState(false),[loading,setLoading]=useState(false),[message,setMessage]=useState("");
  const resolveEmail=(value:string)=>{const normalized=value.trim().toLocaleUpperCase("pt-BR");const usernames:Record<string,string>={"MT6 CELULARES":"mt6celular1543@gmail.com","PONTO TECH ASSISTENCIA TECNICA":"pontotechtoledo@gmail.com"};return usernames[normalized]??value.trim()};
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const loginEmail=resolveEmail(identifier);const {error}=await supabase.auth.signInWithPassword({email:loginEmail,password});setLoading(false);if(error){setMessage("Usuário/e-mail ou senha inválidos.");return}navigate({to:"/dashboard",replace:true})};
  const forgot=async()=>{if(!identifier){setMessage("Digite seu e-mail para recuperar a senha.");return}const recoveryEmail=resolveEmail(identifier);if(!recoveryEmail.includes("@")){setMessage("Para recuperar a senha, informe o e-mail cadastrado.");return}const {error}=await supabase.auth.resetPasswordForEmail(recoveryEmail,{redirectTo:`${window.location.origin}/reset-password`});setMessage(error?"Não foi possível enviar o e-mail.":"Se o e-mail estiver cadastrado, você receberá as instruções.")};
  return <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(30rem,0.92fr)_minmax(34rem,1.08fr)]">
    <section className="flex min-h-screen items-center px-6 py-10 sm:px-12 lg:px-[clamp(3rem,7vw,8rem)]">
      <div className="mx-auto w-full max-w-md lg:mx-0">
        <div className="mb-8 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground shadow-brand"><Wrench className="size-5"/></span><div><p className="font-display text-lg font-extrabold leading-tight">Service Pro OS</p><p className="text-xs font-semibold text-primary">Gestão para sua Assistência Técnica</p></div></div><div className="mb-8"><p className="mb-3 text-xs font-bold uppercase text-primary">Área segura</p><h1 className="font-display text-3xl font-extrabold sm:text-4xl">Bem-vindo de volta</h1></div>
        <form className="grid gap-5" onSubmit={submit}>
          <label className="grid gap-2 text-xs font-bold uppercase">Usuário ou e-mail<div className="relative"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="h-12 bg-card pl-11" type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} autoComplete="username" placeholder="Digite seu usuário ou e-mail" required/></div></label>
          <label className="grid gap-2 text-xs font-bold uppercase"><span className="flex items-center justify-between"><span>Senha</span><Button type="button" variant="link" className="h-auto p-0 text-xs normal-case" onClick={forgot}>Esqueci minha senha</Button></span><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="h-12 bg-card px-11" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Digite sua senha" required/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" onClick={()=>setShow(v=>!v)} aria-label={show?"Ocultar senha":"Mostrar senha"}>{show?<EyeOff/>:<Eye/>}</Button></div></label>
          {message&&<p className="rounded-md border bg-muted p-3 text-sm" role="status">{message}</p>}
          <Button className="mt-1 h-12 gap-2 shadow-brand" disabled={loading}>{loading?"Entrando…":<>Entrar no painel <ArrowRight className="size-4"/></>}</Button>
        </form>
        <div className="mt-7 rounded-lg border bg-card p-4 text-center"><p className="text-sm font-semibold">Ainda não possui uma conta?</p><p className="mt-1 text-sm text-muted-foreground">Crie sua empresa e comece com 3 dias grátis.</p><Button type="button" variant="outline" className="mt-3 w-full gap-2" onClick={()=>{window.location.href="/cadastro"}}><UserPlus className="size-4"/> Criar conta grátis</Button></div>
      </div>
    </section>
    <aside className="auth-showcase relative hidden min-h-screen overflow-hidden bg-brand-ink p-12 text-brand-ink-foreground lg:flex lg:flex-col lg:justify-between">
      <div className="auth-grid" aria-hidden="true"/>
      <div className="relative z-10 ml-auto flex items-center gap-2 rounded-md border border-brand-ink-border bg-brand-ink-surface px-3 py-2 text-xs"><CheckCircle2 className="size-4 text-success"/> Operação sincronizada e protegida</div>
      <div className="relative z-10 max-w-xl"><p className="text-xs font-bold uppercase text-brand-ink-muted">Sua assistência em movimento</p><h2 className="mt-4 font-display text-4xl font-extrabold leading-tight xl:text-5xl">Do aparelho recebido à garantia emitida.</h2><p className="mt-5 max-w-lg text-base leading-7 text-brand-ink-muted">Uma visão clara de cada etapa, com histórico organizado e informações acessíveis para toda a equipe.</p><div className="mt-10 grid max-w-lg grid-cols-2 gap-3"><div className="rounded-md border border-brand-ink-border bg-brand-ink-surface p-4"><ClipboardCheck className="size-5 text-brand-highlight"/><p className="mt-6 text-2xl font-extrabold">Ordens</p><p className="mt-1 text-xs text-brand-ink-muted">Fluxo técnico completo</p></div><div className="rounded-md border border-brand-ink-border bg-brand-ink-surface p-4"><ShieldCheck className="size-5 text-success"/><p className="mt-6 text-2xl font-extrabold">Garantias</p><p className="mt-1 text-xs text-brand-ink-muted">Emissão e histórico</p></div></div></div>
      <p className="relative z-10 text-xs text-brand-ink-muted">Service Pro OS • Gestão inteligente</p>
    </aside>
  </main>;
}