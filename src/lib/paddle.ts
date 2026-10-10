import { resolvePaddlePrice } from "@/utils/payments.functions";

const clientToken = import.meta.env["VITE_PAYMENTS_CLIENT_TOKEN"];

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (environment: "sandbox" | "production") => void };
      Initialize: (options: { token: string }) => void;
      Checkout: { open: (options: unknown) => void };
    };
  }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let initialized = false;
let initialization: Promise<void> | undefined;
export async function initializePaddle() {
  if (initialized) return;
  if (!clientToken) throw new Error("Pagamentos indisponíveis");
  if (initialization) return initialization;
  initialization = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]');
    const script = existing ?? document.createElement("script");
    script.onload = () => {
      if (!window.Paddle) { reject(new Error("Não foi possível carregar o pagamento.")); return; }
      window.Paddle.Environment.set(getPaddleEnvironment() === "sandbox" ? "sandbox" : "production");
      window.Paddle.Initialize({ token: clientToken });
      initialized = true;
      resolve();
    };
    script.onerror = () => { script.remove(); reject(new Error("Não foi possível carregar o pagamento. Confira sua conexão.")); };
    if (!existing) { script.src = "https://cdn.paddle.com/paddle/v2/paddle.js"; document.head.appendChild(script); }
  });
  try { await initialization; } catch (error) { initialization = undefined; throw error; }
}

export async function getPaddlePriceId(priceId: string) {
  return resolvePaddlePrice({ data: { priceId, environment: getPaddleEnvironment() } });
}