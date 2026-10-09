import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Building2, Eye, EyeOff, Mail, UserRound, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [
    { title: "Criar conta | Service Pro OS" },
    { name: "description", content: "Crie sua conta e cadastre sua empresa no Service Pro OS." },
  ] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setLoading(false);
      setMessage(error.message.includes("already registered")
        ? "Este e-mail já possui cadastro. Entre na sua conta ou recupere a senha."
        : "Não foi possível criar a conta. Confira os dados e tente novamente.");
      return;
    }
    if (data.session && data.user) {
      const { error: provisionError } = await supabase.rpc("ensure_user_organization");
      setLoading(false);
      if (provisionError) {
        setMessage("Sua conta foi criada, mas não conseguimos preparar a empresa. Entre novamente em alguns instantes ou fale com o suporte.");
        return;
      }
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setLoading(false);
    setSuccess(true);
    setMessage("Enviamos um link de confirmação para seu e-mail. Confirme o cadastro e depois entre no sistema para iniciar seu teste grátis de 3 dias.");
  };

  return <main className="grid min-h-screen place-items-center bg-background px-4 py-8">
    <section className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-card sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground"><Wrench className="size-5" /></span>
        <div><p className="font-display text-lg font-extrabold">Service Pro OS</p><p className="text-xs font-semibold text-primary">Gestão para sua Assistência Técnica</p></div>
      </div>
      <h1 className="font-display text-2xl font-extrabold">Crie sua conta grátis</h1>
      <p className="mt-2 text-sm text-muted-foreground">Cadastre sua empresa e teste o sistema gratuitamente por 3 dias.</p>
      {success ? <div className="mt-6 space-y-4">
        <p className="rounded-md border bg-muted p-4 text-sm" role="status">{message}</p>
        <Button className="w-full" onClick={() => navigate({ to: "/auth", replace: true })}>Ir para o login</Button>
      </div> : <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-medium">Seu nome
          <div className="relative"><UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome completo" required /></div>
        </label>
        <label className="grid gap-2 text-sm font-medium">Nome da empresa
          <div className="relative"><Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" autoComplete="organization" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da sua assistência" required /></div>
        </label>
        <label className="grid gap-2 text-sm font-medium">E-mail
          <div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-10" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com.br" required /></div>
        </label>
        <label className="grid gap-2 text-sm font-medium">Senha
          <div className="relative"><Input className="pr-10" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" required /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>
        </label>
        <label className="grid gap-2 text-sm font-medium">Confirme a senha
          <Input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Digite a senha novamente" required />
        </label>
        {message && <p className="rounded-md border bg-muted p-3 text-sm" role="status">{message}</p>}
        <Button className="mt-2 h-11" disabled={loading}>{loading ? "Criando conta…" : "Criar conta e começar teste grátis"}</Button>
      </form>}
      <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => navigate({ to: "/auth" })}><ArrowLeft className="size-4" /> Já tenho conta</button>
    </section>
  </main>;
}
