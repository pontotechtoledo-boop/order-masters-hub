import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Input = { device: string; reported: string; observed: string };

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n).trim();

export const generateDiagnosis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: Input) => {
    const out = { device: clip(d?.device, 200), reported: clip(d?.reported, 2000), observed: clip(d?.observed, 2000) };
    if (out.reported.length < 5 && out.observed.length < 5) throw new Error("Descreva o defeito ou os sintomas antes de gerar o diagnóstico.");
    return out;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Assistente de diagnóstico não configurado." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system:
          "Você é um técnico sênior de assistência técnica (celulares, notebooks, eletrônicos). Responda em português do Brasil, de forma objetiva, em texto simples sem markdown pesado. Estruture: 'Hipóteses prováveis' (3 a 5, da mais à menos provável, com motivo curto) e 'Testes recomendados' (passos práticos de bancada em ordem, com o que observar). Termine com um alerta de segurança se houver risco (bateria estufada, curto, líquido). Não invente dados do aparelho; são hipóteses para o técnico confirmar.",
        prompt: `Equipamento: ${data.device || "não informado"}\nDefeito relatado pelo cliente: ${data.reported || "não informado"}\nSintomas observados na recepção: ${data.observed || "não informado"}`,
        providerOptions: {
          openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
        },
      });
      const text = (await result.text).trim();
      if (!text) return { ok: false as const, error: "O assistente não retornou sugestões. Tente descrever o defeito com mais detalhes." };
      return { ok: true as const, text };
    } catch (e) {
      const status = (e as { statusCode?: number })?.statusCode;
      console.error("diagnosis error", status, e);
      if (status === 402) return { ok: false as const, error: "Créditos de IA esgotados. Adicione créditos no workspace para continuar." };
      if (status === 429) return { ok: false as const, error: "Muitas solicitações agora. Aguarde um minuto e tente de novo." };
      return { ok: false as const, error: "Não foi possível gerar o diagnóstico agora." };
    }
  });
