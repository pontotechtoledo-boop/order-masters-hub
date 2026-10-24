import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { planIdFromHotmartAmount } from "@/lib/hotmart";

const payloadSchema = z.object({
  id: z.string().min(1).max(200),
  event: z.string().min(1).max(80),
  creation_date: z.number().optional(),
  data: z.object({
    buyer: z.object({ email: z.string().email().max(320) }).partial().optional(),
    purchase: z.object({
      transaction: z.string().max(200).optional(),
      price: z.object({ value: z.number() }).partial().optional(),
      full_price: z.object({ value: z.number() }).partial().optional(),
    }).partial().optional(),
    subscription: z.object({ subscriber: z.object({ code: z.string().max(200) }).partial().optional() }).partial().optional(),
  }).passthrough(),
}).passthrough();

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/payments/hotmart")({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env["HOTMART_HOTTOK"];
    const hottok = request.headers.get("x-hotmart-hottok") ?? "";
    if (!secret || !safeEqual(hottok, secret)) return new Response("Não autorizado", { status: 401 });

    let parsed;
    try { parsed = payloadSchema.parse(await request.json()); }
    catch { return new Response("Dados inválidos", { status: 400 }); }

    const { data } = parsed;
    const amount = data.purchase?.full_price?.value ?? data.purchase?.price?.value ?? null;
    const priceId = planIdFromHotmartAmount(amount) ?? "";
    const occurredAt = new Date(parsed.creation_date ?? Date.now()).toISOString();
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: result, error } = await supabaseAdmin.rpc("process_hotmart_event" as never, {
        _event_id: parsed.id,
        _event: parsed.event,
        _occurred_at: occurredAt,
        _email: data.buyer?.email ?? "",
        _subscriber_code: data.subscription?.subscriber?.code ?? data.purchase?.transaction ?? "",
        _price_id: priceId,
      } as never);
      if (error) throw error;
      if (result !== "ok" && result !== "duplicate") console.warn("Hotmart evento não aplicado:", parsed.event, result);
      return Response.json({ received: true, result });
    } catch (error) {
      console.error("Falha ao processar evento Hotmart", error);
      return new Response("Falha no processamento", { status: 500 });
    }
  } } },
});
