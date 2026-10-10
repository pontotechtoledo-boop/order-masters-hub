import { createFileRoute } from "@tanstack/react-router";
import { type PaddleEnv, verifyWebhook } from "@/lib/paddle.server";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const rawEnv = new URL(request.url).searchParams.get("env");
    if (rawEnv !== "live" && rawEnv !== "sandbox") return new Response("Ambiente inválido", { status: 400 });
    const environment: PaddleEnv = rawEnv;
    let event;
    try { event = await verifyWebhook(request, environment); }
    catch { return new Response("Assinatura inválida", { status: 400 }); }
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("process_subscription_payment", { _event_id: event.eventId, _environment: environment, _occurred_at: event.occurredAt, _event_type: event.eventType, _payload: JSON.parse(JSON.stringify(event.data)) });
      if (error) throw error;
      return Response.json({ received: true });
    } catch (error) {
      console.error("Falha no recebimento do pagamento", error);
      return new Response("Falha no processamento", { status: 500 });
    }
  } } },
});