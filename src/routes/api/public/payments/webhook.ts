import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, createStripeClient, verifyWebhook } from "@/lib/stripe.server";

// Normaliza os eventos do Stripe para o formato processado por
// process_subscription_payment (checkout.completed, subscription.upsert,
// subscription.canceled, invoice.payment_failed).
async function normalizeEvent(event: { type: string; data: { object: any } }, environment: StripeEnv) {
  const object = event.data.object;
  switch (event.type) {
    case "checkout.session.completed": {
      if (object.mode !== "subscription" || object.payment_status === "unpaid") return null;
      // O evento não traz os itens da compra; buscamos a sessão completa para
      // identificar o preço contratado (lookup_key) e conferir com a reserva.
      const stripe = createStripeClient(environment);
      const session = await stripe.checkout.sessions.retrieve(object.id, { expand: ["line_items"] });
      const item = session.line_items?.data?.[0];
      return {
        type: "checkout.completed",
        occurredAt: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
        payload: {
          sessionId: session.id,
          checkoutId: session.metadata?.["checkoutId"],
          subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
          customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
          priceId: item?.price?.lookup_key ?? (item?.price as { metadata?: Record<string, string> } | undefined)?.metadata?.["lovable_external_id"] ?? null,
          status: "active",
        },
      };
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const item = object.items?.data?.[0];
      return {
        type: "subscription.upsert",
        occurredAt: new Date().toISOString(),
        payload: {
          subscriptionId: object.id,
          customerId: typeof object.customer === "string" ? object.customer : object.customer?.id,
          checkoutId: object.metadata?.checkoutId,
          priceId: item?.price?.lookup_key ?? item?.price?.metadata?.lovable_external_id ?? null,
          status: object.status,
          periodStart: item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : null,
          periodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
          cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
        },
      };
    }
    case "customer.subscription.deleted":
      return {
        type: "subscription.canceled",
        occurredAt: new Date().toISOString(),
        payload: { subscriptionId: object.id, cancelAtPeriodEnd: true },
      };
    case "invoice.payment_failed": {
      const subscription = object.parent?.subscription_details?.subscription ?? object.subscription;
      return {
        type: "invoice.payment_failed",
        occurredAt: object.created ? new Date(object.created * 1000).toISOString() : new Date().toISOString(),
        payload: { subscriptionId: typeof subscription === "string" ? subscription : subscription?.id },
      };
    }
    default:
      return null;
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const rawEnv = new URL(request.url).searchParams.get("env");
    if (rawEnv !== "live" && rawEnv !== "sandbox") return Response.json({ received: true, ignored: "invalid env" });
    const environment: StripeEnv = rawEnv;
    let event;
    try { event = await verifyWebhook(request, environment); }
    catch { return new Response("Assinatura inválida", { status: 400 }); }
    const normalized = await normalizeEvent(event, environment);
    if (!normalized) return Response.json({ received: true });
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("process_subscription_payment", {
        _event_id: (event as { id?: string }).id ?? `${event.type}:${Date.now()}`,
        _environment: environment,
        _occurred_at: normalized.occurredAt,
        _event_type: normalized.type,
        _payload: JSON.parse(JSON.stringify(normalized.payload)),
      });
      if (error) throw error;
      return Response.json({ received: true });
    } catch (error) {
      console.error("Falha no recebimento do pagamento", error);
      return new Response("Falha no processamento", { status: 500 });
    }
  } } },
});
