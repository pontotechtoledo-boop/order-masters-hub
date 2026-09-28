import { createFileRoute } from "@tanstack/react-router";
import { EventName, type PaddleEnv, verifyWebhook } from "@/lib/paddle.server";

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const rawEnv = new URL(request.url).searchParams.get("env");
    const environment: PaddleEnv = rawEnv === "live" ? "live" : "sandbox";
    try {
      const event = await verifyWebhook(request, environment);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (event.eventType === EventName.SubscriptionCreated) {
        const data = event.data;
        const userId = data.customData?.userId;
        const organizationId = data.customData?.organizationId;
        const item = data.items[0];
        const priceId = item?.price.importMeta?.externalId;
        const productId = item?.product.importMeta?.externalId;
        if (typeof userId === "string" && typeof organizationId === "string" && priceId && productId) {
          const period = data.currentBillingPeriod;
          const { error } = await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId, organization_id: organizationId, paddle_subscription_id: data.id,
            paddle_customer_id: data.customerId, product_id: productId, price_id: priceId,
            status: data.status, current_period_start: period?.startsAt, current_period_end: period?.endsAt,
            environment, updated_at: new Date().toISOString(),
          }, { onConflict: "paddle_subscription_id" });
          if (error) throw error;
        }
      } else if (event.eventType === EventName.SubscriptionUpdated || event.eventType === EventName.SubscriptionCanceled) {
        const data = event.data;
        const period = data.currentBillingPeriod;
        const { error } = await supabaseAdmin.from("subscriptions").update({
          status: event.eventType === EventName.SubscriptionCanceled ? "canceled" : data.status,
          current_period_start: period?.startsAt, current_period_end: period?.endsAt,
          cancel_at_period_end: data.scheduledChange?.action === "cancel", updated_at: new Date().toISOString(),
        }).eq("paddle_subscription_id", data.id).eq("environment", environment);
        if (error) throw error;
      }
      return Response.json({ received: true });
    } catch (error) {
      console.error("Falha no recebimento do pagamento", error);
      return new Response("Evento inválido", { status: 400 });
    }
  } } },
});