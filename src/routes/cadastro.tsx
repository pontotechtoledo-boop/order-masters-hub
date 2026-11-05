import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
export const Route = createFileRoute('/cadastro')({
  head: () => ({ meta: [{ title: 'Criar conta e assinar | Service Pro OS' }, { name: 'description', content: 'Cadastre sua assistência técnica para contratar o Service Pro OS com pagamento seguro pelo Stripe.' }, { property: 'og:title', content: 'Assine o Service Pro OS' }, { property: 'og:description', content: 'Crie sua conta, confirme seu e-mail e escolha sua assinatura.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Signup,
});
function Signup() {
  const [name,setName]=useState(''),[company,setCompany]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[sent,setSent]=useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), company_name: company.trim() }, emailRedirectTo: `${window.location.origin}/auth` } });
      if (error) throw error;
      setSent(true); setMessage('Confira seu e-mail para confirmar o cadastro. Depois, entre para escolher e pagar sua assinatura.');
    } catch(error) { setMessage(error instanceof Error ? error.message : 'Não foi possível criar a conta.'); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-background px-5 py-12"><div className="mx-auto max-w-md"><a href="/" className="mb-10 flex items-center gap-3 font-display text-lg font-bold"><Wrench className="size-6 text-primary" />Service Pro OS</a><h1 className="font-display text-3xl font-bold">Crie sua conta</h1><p className="mt-3 text-sm text-muted-foreground">O acesso é liberado após o pagamento da assinatura.</p>{!sent && <form onSubmit={submit} className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-medium">Seu nome<Input required maxLength={200} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">Nome da assistência<Input required maxLength={200} autoComplete="organization" value={company} onChange={e=>setCompany(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">E-mail<Input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">Senha<Input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} /></label><label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5" /><span>Concordo com os <a href="/termos" className="underline">Termos</a> e a <a href="/privacidade" className="underline">Privacidade</a>.</span></label><Button disabled={busy}>{busy?'Enviando…':'Criar conta'}<ArrowRight /></Button></form>}{message && <p role="status" className="mt-5 border-l-4 border-primary bg-accent p-4 text-sm">{message}</p>}<Button asChild variant="link" className="mt-5 px-0"><a href="/auth">Já tenho conta · Entrar</a></Button></div></main>;
}
