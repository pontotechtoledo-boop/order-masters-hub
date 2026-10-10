import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gatewayFetch } from "@/lib/paddle.server";
import { findPlan, hasPaidAccess, matchesCatalogPrice } from "@/lib/subscriptions";

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

export const createSubscriptionCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.extend({ organizationId: z.string().uuid(), priceId: z.string() }).parse(value))
  .handler(async ({ data, context }) => {
    findPlan(data.priceId);
    const { data: member, error: memberError } = await context.supabase.from("organization_members").select("role").eq("organization_id", data.organizationId).eq("user_id", context.userId).eq("active", true).maybeSingle();
    if (memberError || !member || !["owner", "admin"].includes(member.role)) throw new Error("Somente o proprietário ou administrador pode contratar.");
    const catalogResponse = await gatewayFetch(data.environment, `/prices?external_id=${encodeURIComponent(data.priceId)}`);
    if (!catalogResponse.ok) throw new Error("Pagamentos indisponíveis. Tente novamente em instantes.");
    type CatalogPrice = Parameters<typeof matchesCatalogPrice>[0] & { id: string };
    const catalog = await catalogResponse.json() as { data?: CatalogPrice[] };
    const price = catalog.data?.find(price => matchesCatalogPrice(price, data.priceId));
    if (!price) throw new Error("O preço deste plano ainda não está disponível neste ambiente.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: intent, error } = await supabaseAdmin.rpc("reserve_subscription_checkout", { _organization_id: data.organizationId, _user_id: context.userId, _environment: data.environment, _price_id: data.priceId });
    if (error || !intent) throw new Error(error?.message ?? "Não foi possível iniciar o pagamento.");
    if (intent.paddle_transaction_id) return { transactionId: intent.paddle_transaction_id };
    try {
      const response = await gatewayFetch(data.environment, "/transactions", { method: "POST", body: JSON.stringify({ items: [{ price_id: price.id, quantity: 1 }], collection_mode: "automatic", custom_data: { checkoutId: intent.id, userId: context.userId, organizationId: data.organizationId } }) });
      const result = await response.json() as { data?: { id: string }; error?: { detail?: string } };
      if (!response.ok || !result.data?.id) throw new Error("Não foi possível preparar o pagamento. Tente novamente.");
      const transactionId = result.data.id;
      const { error: saveError } = await supabaseAdmin.from("subscription_checkouts").update({ paddle_transaction_id: transactionId }).eq("id", intent.id);
      if (saveError) throw new Error("Não foi possível vincular o pagamento à empresa.");
      return { transactionId };
    } catch (error) {
      await supabaseAdmin.from("subscription_checkouts").update({ status: "failed" }).eq("id", intent.id);
      throw error;
    }
  });

export const createBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => input.extend({ organizationId: z.string().uuid() }).parse(value))
  .handler(async ({ data, context }) => {
    const { data: member } = await context.supabase.from("organization_members").select("role").eq("organization_id", data.organizationId).eq("user_id", context.userId).eq("active", true).maybeSingle();
    if (!member || !["owner", "admin"].includes(member.role)) throw new Error("Somente o proprietário ou administrador pode gerenciar a assinatura.");
    const { data: subscription } = await context.supabase.from("subscriptions").select("paddle_customer_id,paddle_subscription_id").eq("organization_id", data.organizationId).eq("environment", data.environment).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!subscription) throw new Error("Sua empresa ainda não possui assinatura.");
    const response = await gatewayFetch(data.environment, `/customers/${subscription.paddle_customer_id}/portal-sessions`, { method: "POST", body: JSON.stringify({ subscription_ids: [subscription.paddle_subscription_id] }) });
    const result = await response.json() as { data?: { urls: { general: { overview: string } } } };
    const url = result.data?.urls.general.overview;
    if (!response.ok || !url || !url.startsWith("https://")) throw new Error("Não foi possível abrir a gestão de cobrança.");
    return { url };
  });