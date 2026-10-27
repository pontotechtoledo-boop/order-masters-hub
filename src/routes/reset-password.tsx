import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Redefinir senha | Service Pro OS" },
    { name: "description", content: "Defina uma nova senha para seu acesso ao Service Pro OS." },
    { property: "og:title", content: "Redefinir senha | Service Pro OS" },
    { property: "og:description", content: "Recupere seu acesso ao sistema." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});
function ResetPassword(){const navigate=useNavigate();const [password,setPassword]=useState(""),[ready,setReady]=useState(false),[message,setMessage]=useState("");useEffect(()=>{const recovery=["recovery","invite"].includes(new URLSearchParams(window.location.hash.slice(1)).get("type")??"");supabase.auth.getSession().then(({data})=>setReady(recovery||Boolean(data.session)));},[]);return <main className="grid min-h-screen place-items-center p-4"><section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-card"><h1 className="text-xl font-bold">Crie uma nova senha</h1><p className="mt-1 text-sm text-muted-foreground">Use pelo menos 8 caracteres.</p>{ready?<form className="mt-6 grid gap-4" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password});if(error){const m=error.message.toLowerCase();setMessage(m.includes("weak")||m.includes("pwned")||m.includes("guess")?"Essa senha é muito comum e já apareceu em vazamentos na internet. Escolha outra, misturando letras, números e símbolos (ex.: Bancada#2026Toledo).":m.includes("same")||m.includes("different from the old")?"A nova senha precisa ser diferente da anterior.":m.includes("session")||m.includes("expired")||m.includes("jwt")?"O link expirou. Peça um novo em “Esqueci minha senha”.":"Não foi possível alterar a senha. Tente uma senha diferente.");return}navigate({to:"/dashboard",replace:true})}}><Input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><Button>Salvar nova senha</Button></form>:<p className="mt-6 rounded-md bg-muted p-3 text-sm">Este link expirou ou não é válido.</p>}{message&&<p className="mt-3 text-sm text-destructive">{message}</p>}</section></main>}