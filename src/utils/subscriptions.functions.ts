import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { findPlan, hasPaidAccess } from "@/lib/subscriptions";

const input = z.object({ organizationId: z.string().uuid().optional(), environment: z.enum(["sandbox", "live"]) });

export const getBillingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.parse(value))
  .handler(async ({ data, context }) => {
    const memberQuery = context.supabase.from("organization_members").select("organization_id,role,organizations(id,name,trial_ends_at)").eq("user_id", context.userId).eq("active", true).order("created_at").limit(1);
    if (data.organizationId) memberQuery.eq("organization_id", data.organizationId);
    const { data: member, error } = await memberQuery.maybeSingle();
    if (error || !member?.organizations) throw new Error("Não foi possível consultar a empresa da sua conta.");
    const organization = member.organizations;
    const { data: subscription, error: subscriptionError } = await context.supabase.from("subscriptions").select("status,price_id,current_period_end,cancel_at_period_end,first_failed_at,payment_confirmed_at").eq("organization_id", member.organization_id).eq("environment", data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (subscriptionError) throw new Error("Não foi possível consultar a assinatura.");
    return { organization, subscription, canManage: ["owner", "admin"].includes(member.role), paidAccess: hasPaidAccess(subscription), trialActive: Boolean(organization.trial_ends_at && Date.parse(organization.trial_ends_at) > Date.now()) };
  });

type CheckoutResult = { clientSecret: string } | { error: string };

export const createSubscriptionCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.extend({ organizationId: z.string().uuid(), priceId: z.string(), returnUrl: z.string().url() }).parse(value))
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      findPlan(data.priceId);
      const { data: member, error: memberError } = await context.supabase.from("organization_members").select("role").eq("organization_id", data.organizationId).eq("user_id", context.userId).eq("active", true).maybeSingle();
      if (memberError || !member || !["owner", "admin"].includes(member.role)) throw new Error("Somente o proprietário ou administrador pode contratar.");

      const stripe = createStripeClient(data.environment as StripeEnv);
      // Resolve o preço pelo lookup_key e confere valor, moeda e ciclo com o catálogo interno.
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      const plan = findPlan(data.priceId);
      if (!stripePrice || stripePrice.type !== "recurring" || !stripePrice.active) throw new Error("O preço deste plano ainda não está disponível neste ambiente.");
      if (stripePrice.currency !== "brl" || stripePrice.unit_amount !== plan.amount) throw new Error("O preço deste plano não confere com o catálogo.");
      const recurring = stripePrice.recurring;
      if (!recurring || recurring.interval !== plan.interval || recurring.interval_count !== plan.frequency) throw new Error("O ciclo deste plano não confere com o catálogo.");

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: intent, error } = await supabaseAdmin.rpc("reserve_subscription_checkout", { _organization_id: data.organizationId, _user_id: context.userId, _environment: data.environment, _price_id: data.priceId });
      if (error || !intent) throw new Error(error?.message ?? "Não foi possível iniciar o pagamento.");

      // Sessão reutilizada: devolve o clientSecret já vinculado à contratação.
      if (intent.gateway_session_id) {
        const existing = await stripe.checkout.sessions.retrieve(intent.gateway_session_id);
        if (existing.status === "open" && existing.client_secret) return { clientSecret: existing.client_secret };
      }

      try {
        const session = await stripe.checkout.sessions.create({
          line_items: [{ price: stripePrice.id, quantity: 1 }],
          mode: "subscription",
          ui_mode: "embedded_page",
          return_url: data.returnUrl,
          locale: "pt-BR",
          metadata: { checkoutId: intent.id, userId: context.userId, organizationId: data.organizationId },
          subscription_data: { metadata: { checkoutId: intent.id, userId: context.userId, organizationId: data.organizationId } },
        });
        if (!session.client_secret) throw new Error("Não foi possível preparar o pagamento. Tente novamente.");
        const { error: saveError } = await supabaseAdmin.from("subscription_checkouts").update({ gateway_session_id: session.id }).eq("id", intent.id);
        if (saveError) throw new Error("Não foi possível vincular o pagamento à empresa.");
        return { clientSecret: session.client_secret };
      } catch (error) {
        // Libera a contratação para uma nova tentativa imediata.
        await supabaseAdmin.from("subscription_checkouts").update({ status: "failed" }).eq("id", intent.id).is("gateway_session_id", null);
        throw error;
      }
    } catch (error) {
      return { error: error instanceof Error && !("type" in error) ? error.message : getStripeErrorMessage(error) };
    }
  });

type PortalResult = { url: string } | { error: string };

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.extend({ organizationId: z.string().uuid(), returnUrl: z.string().url() }).parse(value))
  .handler(async ({ data, context }): Promise<PortalResult> => {
    const { data: member } = await context.supabase.from("organization_members").select("role").eq("organization_id", data.organizationId).eq("user_id", context.userId).eq("active", true).maybeSingle();
    if (!member || !["owner", "admin"].includes(member.role)) throw new Error("Somente o proprietário ou administrador pode gerenciar a assinatura.");
    const { data: subscription } = await context.supabase.from("subscriptions").select("gateway_customer_id").eq("organization_id", data.organizationId).eq("environment", data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!subscription?.gateway_customer_id) throw new Error("Sua empresa ainda não possui assinatura.");
    try {
      const stripe = createStripeClient(data.environment as StripeEnv);
      const portal = await stripe.billingPortal.sessions.create({ customer: subscription.gateway_customer_id, return_url: data.returnUrl });
      return { url: portal.url };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

type PlanChangeResult = { ok: true } | { error: string };

export const changeSubscriptionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.extend({ organizationId: z.string().uuid(), priceId: z.string() }).parse(value))
  .handler(async ({ data, context }): Promise<PlanChangeResult> => {
    try {
      findPlan(data.priceId);
      const { data: member } = await context.supabase.from("organization_members").select("role").eq("organization_id", data.organizationId).eq("user_id", context.userId).eq("active", true).maybeSingle();
      if (!member || !["owner", "admin"].includes(member.role)) throw new Error("Somente o proprietário ou administrador pode alterar o plano.");
      const { data: subscription } = await context.supabase.from("subscriptions").select("gateway_subscription_id,price_id,status").eq("organization_id", data.organizationId).eq("environment", data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!subscription || !["active", "trialing"].includes(subscription.status)) throw new Error("Só é possível trocar de plano com a assinatura ativa.");
      if (subscription.price_id === data.priceId) throw new Error("Este já é o seu plano.");

      const stripe = createStripeClient(data.environment as StripeEnv);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const stripePrice = prices.data[0];
      if (!stripePrice) throw new Error("O preço deste plano ainda não está disponível neste ambiente.");

      const current = await stripe.subscriptions.retrieve(subscription.gateway_subscription_id!);
      const itemId = current.items.data[0]?.id;
      if (!itemId) throw new Error("Não foi possível identificar o plano atual.");
      // Sem cobrança proporcional: o novo valor passa a valer na próxima renovação.
      await stripe.subscriptions.update(subscription.gateway_subscription_id!, {
        items: [{ id: itemId, price: stripePrice.id, quantity: 1 }],
        proration_behavior: "none",
      });
      return { ok: true };
    } catch (error) {
      return { error: error instanceof Error && !("type" in error) ? error.message : getStripeErrorMessage(error) };
    }
  });
