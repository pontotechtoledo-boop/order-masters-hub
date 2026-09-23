CREATE TYPE public.app_role AS ENUM ('owner','admin','attendant','technician','finance');
CREATE TYPE public.order_status AS ENUM ('received','triage','diagnosis','quote','awaiting_approval','approved','waiting_parts','repair','testing','ready','delivered','cancelled','no_repair','warranty_return');
CREATE TYPE public.order_priority AS ENUM ('low','normal','high','urgent');
CREATE TYPE public.financial_type AS ENUM ('income','expense');
CREATE TYPE public.financial_status AS ENUM ('pending','paid','overdue','cancelled');

CREATE TABLE public.organizations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, document text, email text, phone text, logo_url text,
 plan text NOT NULL DEFAULT 'trial', subscription_status text NOT NULL DEFAULT 'trial', trial_ends_at timestamptz DEFAULT now() + interval '14 days',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated; GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
 id uuid PRIMARY KEY, full_name text NOT NULL, phone text, avatar_url text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.organization_members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, role public.app_role NOT NULL DEFAULT 'attendant', active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated; GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_org uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM organization_members WHERE organization_id=_org AND user_id=auth.uid() AND active) $$;
CREATE OR REPLACE FUNCTION public.has_org_role(_org uuid, _roles public.app_role[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM organization_members WHERE organization_id=_org AND user_id=auth.uid() AND active AND role=ANY(_roles)) $$;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated; GRANT EXECUTE ON FUNCTION public.has_org_role(uuid,public.app_role[]) TO authenticated;

CREATE POLICY organizations_member_read ON public.organizations FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY organizations_member_update ON public.organizations FOR UPDATE TO authenticated USING (public.has_org_role(id,ARRAY['owner','admin']::public.app_role[]));
CREATE POLICY profiles_self ON public.profiles FOR ALL TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE POLICY profiles_org_read ON public.profiles FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM organization_members mine JOIN organization_members theirs ON mine.organization_id=theirs.organization_id WHERE mine.user_id=auth.uid() AND theirs.user_id=profiles.id));
CREATE POLICY members_org_read ON public.organization_members FOR SELECT TO authenticated USING (public.is_org_member(organization_id));
CREATE POLICY members_org_manage ON public.organization_members FOR ALL TO authenticated USING (public.has_org_role(organization_id,ARRAY['owner','admin']::public.app_role[])) WITH CHECK (public.has_org_role(organization_id,ARRAY['owner','admin']::public.app_role[]));

CREATE TABLE public.branches (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, name text NOT NULL, phone text, address text, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.branches TO authenticated; GRANT ALL ON public.branches TO service_role; ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY branches_org ON public.branches FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.customers (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, kind text NOT NULL DEFAULT 'person', name text NOT NULL, document text, email text, phone text, address text, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.customers TO authenticated; GRANT ALL ON public.customers TO service_role; ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_org ON public.customers FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX customers_org_name_idx ON public.customers(organization_id,name);

CREATE TABLE public.devices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE, category text NOT NULL, brand text, model text, serial_number text, accessories text, condition_notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.devices TO authenticated; GRANT ALL ON public.devices TO service_role; ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY devices_org ON public.devices FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX devices_customer_idx ON public.devices(organization_id,customer_id);

CREATE TABLE public.service_orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, branch_id uuid REFERENCES public.branches(id), customer_id uuid NOT NULL REFERENCES public.customers(id), device_id uuid NOT NULL REFERENCES public.devices(id), order_number bigint GENERATED BY DEFAULT AS IDENTITY, status public.order_status NOT NULL DEFAULT 'received', priority public.order_priority NOT NULL DEFAULT 'normal', assigned_to uuid REFERENCES public.profiles(id), reported_issue text NOT NULL, diagnosis text, technical_report text, estimated_at timestamptz, completed_at timestamptz, delivered_at timestamptz, subtotal numeric(12,2) NOT NULL DEFAULT 0, discount numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) GENERATED ALWAYS AS (subtotal-discount) STORED, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.service_orders TO authenticated; GRANT ALL ON public.service_orders TO service_role; GRANT USAGE,SELECT ON SEQUENCE public.service_orders_order_number_seq TO authenticated,service_role; ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_org ON public.service_orders FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX orders_org_status_idx ON public.service_orders(organization_id,status,created_at DESC);

CREATE TABLE public.service_order_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, order_id uuid NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE, item_type text NOT NULL, description text NOT NULL, quantity numeric(10,2) NOT NULL DEFAULT 1, unit_price numeric(12,2) NOT NULL DEFAULT 0, cost numeric(12,2) NOT NULL DEFAULT 0, warranty_days integer NOT NULL DEFAULT 90, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.service_order_items TO authenticated; GRANT ALL ON public.service_order_items TO service_role; ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_org ON public.service_order_items FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.order_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, order_id uuid NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE, user_id uuid REFERENCES public.profiles(id), event_type text NOT NULL, description text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.order_events TO authenticated; GRANT ALL ON public.order_events TO service_role; ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_events_read ON public.order_events FOR SELECT TO authenticated USING (public.is_org_member(organization_id)); CREATE POLICY order_events_add ON public.order_events FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.warranties (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, order_id uuid NOT NULL REFERENCES public.service_orders(id), code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)), starts_at date NOT NULL DEFAULT current_date, expires_at date NOT NULL, terms text, coverage text, status text NOT NULL DEFAULT 'active', sent_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.warranties TO authenticated; GRANT ALL ON public.warranties TO service_role; ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
CREATE POLICY warranties_org ON public.warranties FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX warranties_org_expiry_idx ON public.warranties(organization_id,expires_at);

CREATE TABLE public.inventory_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, branch_id uuid REFERENCES public.branches(id), sku text, name text NOT NULL, category text, supplier text, location text, quantity numeric(12,2) NOT NULL DEFAULT 0, minimum_quantity numeric(12,2) NOT NULL DEFAULT 0, cost numeric(12,2) NOT NULL DEFAULT 0, price numeric(12,2) NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(organization_id,sku));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.inventory_items TO authenticated; GRANT ALL ON public.inventory_items TO service_role; ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventory_org ON public.inventory_items FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX inventory_org_name_idx ON public.inventory_items(organization_id,name);

CREATE TABLE public.inventory_movements (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, inventory_item_id uuid NOT NULL REFERENCES public.inventory_items(id), order_id uuid REFERENCES public.service_orders(id), movement_type text NOT NULL, quantity numeric(12,2) NOT NULL, unit_cost numeric(12,2), notes text, created_by uuid REFERENCES public.profiles(id), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.inventory_movements TO authenticated; GRANT ALL ON public.inventory_movements TO service_role; ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY movements_read ON public.inventory_movements FOR SELECT TO authenticated USING (public.is_org_member(organization_id)); CREATE POLICY movements_add ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

CREATE TABLE public.financial_entries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, branch_id uuid REFERENCES public.branches(id), order_id uuid REFERENCES public.service_orders(id), entry_type public.financial_type NOT NULL, status public.financial_status NOT NULL DEFAULT 'pending', category text NOT NULL, description text NOT NULL, amount numeric(12,2) NOT NULL, due_date date, paid_at timestamptz, payment_method text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.financial_entries TO authenticated; GRANT ALL ON public.financial_entries TO service_role; ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_org ON public.financial_entries FOR ALL TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE INDEX financial_org_status_idx ON public.financial_entries(organization_id,status,due_date);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TRIGGER organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER branches_updated BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER devices_updated BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER warranties_updated BEFORE UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER inventory_updated BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER financial_updated BEFORE UPDATE ON public.financial_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();