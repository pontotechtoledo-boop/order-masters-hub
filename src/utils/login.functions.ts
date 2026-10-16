import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({ identifier: z.string().trim().min(1).max(200), password: z.string().min(1).max(200) });

// Signs in by e-mail or username without ever revealing the e-mail tied to a username.
export const signInWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator(value => input.parse(value))
  .handler(async ({ data }) => {
    const fail = { ok: false as const };
    let email = data.identifier.toLowerCase();
    if (!email.includes("@")) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin.from("profiles").select("id").ilike("username", data.identifier.replace(/[%_\\]/g, "\\$&")).maybeSingle();
      if (!profile) return fail;
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (!user.user?.email) return fail;
      email = user.user.email;
    }
    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: key.startsWith("sb_") ? { fetch: (url, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(url, { ...init, headers: h }); } } : undefined,
    });
    const { data: session, error } = await client.auth.signInWithPassword({ email, password: data.password });
    if (error || !session.session) return fail;
    return { ok: true as const, access_token: session.session.access_token, refresh_token: session.session.refresh_token };
  });
