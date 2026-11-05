ALTER TABLE public.public_subscription_purchases ADD COLUMN activation_expires_at timestamptz;
CREATE OR REPLACE FUNCTION public.revoke_public_purchase(_id uuid,_occurred_at timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN UPDATE public.public_subscription_purchases SET status='revoked',last_event_at=_occurred_at,invite_token_hash=NULL WHERE id=_id AND (last_event_at IS NULL OR last_event_at<=_occurred_at); END; $$;
REVOKE ALL ON FUNCTION public.revoke_public_purchase(uuid,timestamptz) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_public_purchase(uuid,timestamptz) TO service_role;
