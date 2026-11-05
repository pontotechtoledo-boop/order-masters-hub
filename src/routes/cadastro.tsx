import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { newPasswordSchema, passwordErrorMessage } from '@/lib/password-guidance';
import { PasswordRequirements } from '@/components/password-requirements';
import { selectedPlan } from '@/lib/subscriptions';
export const Route = createFileRoute('/cadastro')({
  validateSearch: (search: Record<string, unknown>) => ({ plano: selectedPlan(search.plano) }),
  head: () => ({ meta: [{ title: 'Criar conta e assinar | Service Pro OS' }, { name: 'description', content: 'Cadastre sua assistência técnica para contratar o Service Pro OS com pagamento seguro pelo Stripe.' }, { property: 'og:title', content: 'Assine o Service Pro OS' }, { property: 'og:description', content: 'Crie sua conta, confirme seu e-mail e escolha sua assinatura.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Signup,
});
function Signup() {
  const { plano } = Route.useSearch();
  const loginPath = plano ? `/auth?plano=${encodeURIComponent(plano)}` : '/auth';
  const [name,setName]=useState(''),[company,setCompany]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[sent,setSent]=useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const validation = newPasswordSchema.safeParse(password);
    if (!validation.success) { setMessage(`Confira sua senha: ${validation.error.issues.map(issue => issue.message).join('; ')}.`); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), company_name: company.trim() }, emailRedirectTo: `${window.location.origin}${loginPath}` } });
      if (error) throw error;
      setSent(true); setMessage('Confira seu e-mail para confirmar o cadastro e receber as informações de acesso.');
    } catch(error) { setMessage(passwordErrorMessage(error, 'Não foi possível criar a conta. Confira os dados e tente novamente.')); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-background px-5 py-12"><div className="mx-auto max-w-md"><a href="/" className="mb-10 flex items-center gap-3 font-display text-lg font-bold"><Wrench className="size-6 text-primary" />Service Pro OS</a><h1 className="font-display text-3xl font-bold">Crie sua conta</h1>{!sent && <form onSubmit={submit} className="mt-8 grid gap-5"><label className="grid gap-2 text-sm font-medium">Seu nome<Input required maxLength={200} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">Nome da assistência<Input required maxLength={200} autoComplete="organization" value={company} onChange={e=>setCompany(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">E-mail<Input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="grid gap-2 text-sm font-medium">Senha<Input required type="password" minLength={8} maxLength={128} aria-describedby="signup-password-rules" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} /></label><PasswordRequirements password={password} id="signup-password-rules" /><label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5" /><span>Concordo com os <a href="/termos" className="underline">Termos</a> e a <a href="/privacidade" className="underline">Privacidade</a>.</span></label><Button disabled={busy}>{busy?'Enviando…':'Criar conta'}<ArrowRight /></Button></form>}{message && <p role="status" className="mt-5 border-l-4 border-primary bg-accent p-4 text-sm">{message}</p>}<Button asChild variant="link" className="mt-5 px-0"><a href={loginPath}>Já tenho conta · Entrar</a></Button></div></main>;
}
