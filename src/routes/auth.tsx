import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Entrar | PontoTech" },
    { name: "description", content: "Acesse o sistema de gestão da sua assistência técnica." },
    { property: "og:title", content: "Entrar no PontoTech" },
    { property: "og:description", content: "Acesse ordens, clientes, estoque e garantias da sua empresa." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[show,setShow]=useState(false),[loading,setLoading]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>{ if(data.user) navigate({to:"/dashboard",replace:true}); }); },[navigate]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error){setMessage("E-mail ou senha inválidos.");return}navigate({to:"/dashboard",replace:true})};
  const forgot=async()=>{if(!email){setMessage("Digite seu e-mail para recuperar a senha.");return}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});setMessage(error?"Não foi possível enviar o e-mail.":"Enviamos as instruções para o seu e-mail.")};
  return <main className="grid min-h-screen place-items-center bg-background p-4"><div className="w-full max-w-md"><div className="mb-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-md bg-primary text-primary-foreground"><Wrench/></div><h1 className="mt-5 text-2xl font-extrabold">PontoTech</h1><p className="mt-1 text-sm text-muted-foreground">Acesse a gestão da sua assistência técnica</p></div><section className="rounded-lg border bg-card p-6 shadow-card"><form className="grid gap-4" onSubmit={submit}><label className="grid gap-1.5 text-sm font-semibold">E-mail<div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></div></label><label className="grid gap-1.5 text-sm font-semibold">Senha<div className="relative"><LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="px-9" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={()=>setShow(v=>!v)} aria-label={show?"Ocultar senha":"Mostrar senha"}>{show?<EyeOff/>:<Eye/>}</Button></div></label>{message&&<p className="rounded-md bg-muted p-3 text-sm" role="status">{message}</p>}<Button className="mt-1 h-11" disabled={loading}>{loading?"Entrando…":"Entrar"}</Button><Button type="button" variant="link" onClick={forgot}>Esqueci minha senha</Button></form></section><p className="mt-5 text-center text-xs text-muted-foreground">Seu acesso é criado pelo administrador da plataforma.</p></div></main>;
}