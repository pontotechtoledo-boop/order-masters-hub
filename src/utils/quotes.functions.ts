import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const tokenSchema = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) });
export const createQuote = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(value => z.object({ orderId: z.string().uuid() }).parse(value))
  .handler(async ({ data, context }) => {
    const result = await context.supabase.rpc('create_order_quote', { _order_id: data.orderId });
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const publicQuote = createServerFn({ method: 'POST' })
  .inputValidator(value => tokenSchema.extend({ decision: z.enum(['approved', 'rejected']).optional() }).parse(value))
  .handler(async ({ data }) => {
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error('Orçamentos indisponíveis');
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const result = data.decision
      ? await client.rpc('decide_order_quote', { _token: data.token, _decision: data.decision })
      : await client.rpc('read_order_quote', { _token: data.token });
    if (result.error) throw new Error(result.error.message);
    return result.data as { company: string; number: number; device: string; description: string; amount: number; status: string; expiresAt: string; decidedAt: string | null };
  });