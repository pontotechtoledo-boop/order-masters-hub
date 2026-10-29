import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { planIdFromHotmartPurchase } from "@/lib/hotmart";

const payloadSchema = z.object({
  id: z.string().min(1).max(200),
  event: z.string().min(1).max(80),
  creation_date: z.number().optional(),
  data: z.object({
    buyer: z.object({ email: z.string().email().max(320) }).partial().optional(),
    purchase: z.object({
      transaction: z.string().max(200).optional(),
      offer: z.object({ code: z.string().max(200) }).partial().optional(),
      price: z.object({ value: z.number(), currency_value: z.string().max(10) }).partial().optional(),
      full_price: z.object({ value: z.number(), currency_value: z.string().max(10) }).partial().optional(),
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
  server: { handlers: {
    GET: async () => Response.json({ ok: true }),
    POST: async ({ request }) => {
    const secret = process.env["HOTMART_HOTTOK"];
    const hottok = request.headers.get("x-hotmart-hottok") ?? "";
    if (!secret || !safeEqual(hottok, secret)) return new Response("Não autorizado", { status: 401 });

    let parsed;
    try { parsed = payloadSchema.parse(await request.json()); }
    catch { return new Response("Dados inválidos", { status: 400 }); }

    const { data } = parsed;
    const priceId = planIdFromHotmartPurchase(data.purchase) ?? "";
    // Não consome o evento: a Hotmart deve poder reenviar após corrigir a oferta.
    if (["PURCHASE_APPROVED", "PURCHASE_COMPLETE"].includes(parsed.event) && !priceId) {
      console.warn("Hotmart compra não aplicada: oferta ou preço não reconhecido", parsed.id);
      return new Response("Plano não reconhecido", { status: 422 });
    }
    const occurredAt = new Date(parsed.creation_date ?? Date.now()).toISOString();
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const email = (data.buyer?.email ?? "").trim().toLowerCase();
      const run = () => supabaseAdmin.rpc("process_hotmart_event", {
        _event_id: parsed.id,
        _event: parsed.event,
        _occurred_at: occurredAt,
        _email: email,
        _subscriber_code: data.subscription?.subscriber?.code ?? data.purchase?.transaction ?? "",
        _price_id: priceId,
      });
      let { data: result, error } = await run();
      if (error) throw error;
      // Primeira compra com e-mail novo: cria o acesso e envia o convite para definir a senha.
      // Clientes que já têm conta nunca recebem novo convite; só têm o período estendido.
      if (result === "user_not_found" && email) {
        const buyerName = (data.buyer as { name?: string } | undefined)?.name;
        const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: buyerName ?? email.split("@")[0] },
          redirectTo: "https://serviceproos.app/reset-password",
        });
        if (inviteError) throw inviteError;
        ({ data: result, error } = await run());
        if (error) throw error;
      }
      if (result !== "ok" && result !== "duplicate") console.warn("Hotmart evento não aplicado:", parsed.event, result);
      if (result === "unknown_plan") return new Response("Plano não reconhecido", { status: 422 });
      return Response.json({ received: true, result });
    } catch (error) {
      console.error("Falha ao processar evento Hotmart", error);
      return new Response("Falha no processamento", { status: 500 });
    }
  } } },
});
