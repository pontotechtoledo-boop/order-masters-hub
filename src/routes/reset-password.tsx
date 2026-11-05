import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { newPasswordSchema, passwordErrorMessage, passwordIdentityMessage } from '@/lib/password-guidance';
import { PasswordRequirements } from '@/components/password-requirements';
import { useServerFn } from '@tanstack/react-start';
import { completeRecoveredPurchase } from '@/utils/public-purchase.functions';

export const Route = createFileRoute("/reset-password")({staticData:{sitemap:false},
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
function ResetPassword() {
  const navigate = useNavigate();
  const completePurchase = useServerFn(completeRecoveredPurchase);
  const [password, setPassword] = useState(''), [ready, setReady] = useState(false), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user)));
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    const validation = newPasswordSchema.safeParse(password);
    if (!validation.success) { setMessage(`Confira sua senha: ${validation.error.issues.map(issue => issue.message).join('; ')}.`); return; }
    setBusy(true);
    try {
      const { data } = await supabase.auth.getUser();
      const identityMessage = passwordIdentityMessage(password, data.user?.user_metadata['full_name'], data.user?.user_metadata['company_name']);
      if (identityMessage) { setMessage(identityMessage); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await completePurchase();
      navigate({ to: '/dashboard', replace: true });
    } catch (error) { setMessage(passwordErrorMessage(error, 'Não foi possível alterar a senha. Tente novamente.')); }
    finally { setBusy(false); }
  };
  return <main className="grid min-h-screen place-items-center p-4"><section className="w-full max-w-md rounded-lg border bg-card p-6 shadow-card">
    <h1 className="text-xl font-bold">Crie uma nova senha</h1>
    {ready ? <form className="mt-6 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-medium">Nova senha<Input type="password" autoComplete="new-password" minLength={8} maxLength={128} aria-describedby="reset-password-rules" value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <PasswordRequirements password={password} id="reset-password-rules" />
      <Button disabled={busy}>{busy ? 'Salvando…' : 'Salvar nova senha'}</Button>
    </form> : <p className="mt-6 rounded-md bg-muted p-3 text-sm">Este link expirou ou não é válido.</p>}
    {message && <p role="status" className="mt-3 text-sm text-destructive">{message}</p>}
  </section></main>;
}