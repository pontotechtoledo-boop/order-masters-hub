import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Redefinir senha | PontoTech" },
    { name: "description", content: "Defina uma nova senha para seu acesso ao PontoTech." },
    { property: "og:title", content: "Redefinir senha | PontoTech" },
    { property: "og:description", content: "Recupere seu acesso ao sistema." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});
function ResetPassword(){const navigate=useNavigate();const [password,setPassword]=useState(""),[ready,setReady]=useState(false),[message,setMessage]=useState("");useEffect(()=>{const recovery=new URLSearchParams(window.location.hash.slice(1)).get("type")==="recovery";supabase.auth.getSession().then(({data})=>setReady(recovery||Boolean(data.session)));},[]);return <main className="grid min-h-screen place-items-center p-4"><section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-card"><h1 className="text-xl font-bold">Crie uma nova senha</h1><p className="mt-1 text-sm text-muted-foreground">Use pelo menos 8 caracteres.</p>{ready?<form className="mt-6 grid gap-4" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password});if(error){setMessage("Não foi possível alterar a senha.");return}navigate({to:"/dashboard",replace:true})}}><Input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><Button>Salvar nova senha</Button></form>:<p className="mt-6 rounded-md bg-muted p-3 text-sm">Este link expirou ou não é válido.</p>}{message&&<p className="mt-3 text-sm text-destructive">{message}</p>}</section></main>}