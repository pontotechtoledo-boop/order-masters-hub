CREATE OR REPLACE FUNCTION public.subscription_allows_write(_status text,_period_end timestamptz,_first_failed_at timestamptz,_now timestamptz)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT coalesce(CASE WHEN _status IN ('active','trialing') THEN _period_end IS NOT NULL AND _period_end+interval '7 days'>_now WHEN _status='canceled' THEN _period_end>_now WHEN _status='past_due' THEN _first_failed_at+interval '7 days'>_now ELSE false END,false);
$$;
REVOKE ALL ON FUNCTION public.subscription_allows_write(text,timestamptz,timestamptz,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.subscription_allows_write(text,timestamptz,timestamptz,timestamptz) TO authenticated,service_role;
DO $$
DECLARE definition text; original text := 'IF sub.last_event_at IS NOT NULL AND sub.last_event_at>_occurred_at THEN RETURN; END IF;';
BEGIN
 definition:=pg_get_functiondef('public.process_subscription_payment(text,text,timestamptz,text,jsonb)'::regprocedure);
 IF position(original in definition)=0 THEN RAISE EXCEPTION 'Expected payment ordering guard not found'; END IF;
 definition:=replace(definition,original,'IF sub.last_event_at IS NOT NULL AND sub.last_event_at>_occurred_at AND NOT (_event_type IN (''checkout.completed'',''invoice.paid'') AND _payload->>''status'' IN (''active'',''trialing'') AND (_payload->>''periodEnd'')::timestamptz >= coalesce(sub.current_period_end,''-infinity''::timestamptz)) THEN RETURN; END IF;');
 definition:=replace(definition,'last_event_at=_occurred_at','last_event_at=greatest(last_event_at,_occurred_at)');
 EXECUTE definition;
END $$;