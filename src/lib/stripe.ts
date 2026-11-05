import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { stripeEnvironment } from "./stripe-billing";

export type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

// O ambiente vem do PREFIXO do token público (pk_test_ → sandbox, pk_live_ → live).
// Token ausente ou desconhecido é erro de configuração: nunca cair para "live".
function paymentsEnvironment(): StripeEnv {
  return stripeEnvironment(clientToken);
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}
