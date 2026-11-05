import { Check, Circle } from 'lucide-react';
import { passwordRules, passwordIdentityMessage } from '@/lib/password-guidance';

export function PasswordRequirements({ password, id, name = '', company = '' }: { password: string; id: string; name?: string; company?: string }) {
  return <div id={id} className="space-y-2 text-xs text-muted-foreground">
    <p className="font-medium text-foreground">Sua senha precisa ter:</p>
    <ul className="grid gap-1.5">
      {passwordRules.map(rule => <li key={rule.label} className="flex items-start gap-2">
        {rule.test(password) ? <Check aria-label="Atendido" className="mt-0.5 size-3.5 shrink-0 text-primary" /> : <Circle aria-label="Pendente" className="mt-0.5 size-3.5 shrink-0" />}
        <span>{rule.label}</span>
      </li>)}
    </ul>
    <p className={passwordIdentityMessage(password, name, company) ? 'text-destructive' : ''}>Não use seu nome nem o nome da assistência. Duas palavras diferentes, um símbolo e números fora de sequência ajudam.</p>
  </div>;
}