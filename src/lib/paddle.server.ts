import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";

export { EventName };
export type PaddleEnv = "sandbox" | "live";

const gatewayUrl = "https://connector-gateway.lovable.dev/paddle";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não configurado`);
  return value;
}

function connectionKey(environment: PaddleEnv) {
  return environment === "sandbox" ? env("PADDLE_SANDBOX_API_KEY") : env("PADDLE_LIVE_API_KEY");
}

export function getPaddleClient(environment: PaddleEnv) {
  const key = connectionKey(environment);
  return new Paddle(key, {
    environment: gatewayUrl as unknown as Environment,
    customHeaders: { "X-Connection-Api-Key": key, "Lovable-API-Key": env("LOVABLE_API_KEY") },
  });
}

export async function gatewayFetch(environment: PaddleEnv, path: string, init?: RequestInit) {
  const key = connectionKey(environment);
  return fetch(`${gatewayUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Connection-Api-Key": key, "Lovable-API-Key": env("LOVABLE_API_KEY"), ...init?.headers },
  });
}

export async function verifyWebhook(request: Request, environment: PaddleEnv) {
  const signature = request.headers.get("paddle-signature");
  const body = await request.text();
  const secret = environment === "sandbox" ? env("PAYMENTS_SANDBOX_WEBHOOK_SECRET") : env("PAYMENTS_LIVE_WEBHOOK_SECRET");
  if (!signature || !body) throw new Error("Assinatura ausente");
  return getPaddleClient(environment).webhooks.unmarshal(body, secret, signature);
}