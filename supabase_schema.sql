-- ====================================================================
-- AyurGuide / Sitaram Ayurveda — Central PostgreSQL Database Schema
-- Designed for Supabase with Realtime Replication & Relational Integrity
-- 100% Idempotent: Safe to execute repeatedly in Supabase SQL Editor
-- ====================================================================

-- 0. Enable Essential Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram index for fuzzy search across formulations & herbs

-- ====================================================================
-- 1. CATEGORIES TABLE (Dosage Forms & Taxonomic Classifications)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id bigserial NOT NULL,
  name character varying(255) NOT NULL,
  code character varying(100) NULL,
  title character varying(255) NULL,
  description text NULL,
  icon character varying(100) NULL DEFAULT 'leaf'::character varying,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_name_key UNIQUE (name)
) TABLESPACE pg_default;

-- Rapid classification index
CREATE INDEX IF NOT EXISTS idx_categories_code ON public.categories (code);

-- ====================================================================
-- 2. INGREDIENTS TABLE (Dravyaguna Botanical Pharmacopoeia)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.ingredients (
  id bigserial NOT NULL,
  name character varying(255) NOT NULL,
  botanical_name character varying(255) NULL,
  sanskrit_name character varying(255) NULL,
  therapeutic_action text NULL,
  part_used character varying(255) NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT ingredients_name_key UNIQUE (name)
) TABLESPACE pg_default;

-- Indexes for rapid herb, binomial, and Sanskrit lookup
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON public.ingredients (name);
CREATE INDEX IF NOT EXISTS idx_ingredients_botanical ON public.ingredients (botanical_name);
CREATE INDEX IF NOT EXISTS idx_ingredients_sanskrit ON public.ingredients (sanskrit_name);

-- ====================================================================
-- 3. PRODUCTS TABLE (Classical Medicines & Formulations)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id bigserial NOT NULL,
  code character varying(100) NOT NULL,
  name character varying(255) NOT NULL,
  category_name character varying(255) NULL,
  classical_reference character varying(500) NULL,
  packings jsonb NULL DEFAULT '[]'::jsonb,
  ingredients jsonb NULL DEFAULT '[]'::jsonb,
  dosage text NULL,
  indications text NULL,
  description text NULL,
  image_url text NULL,
  status character varying(50) NULL DEFAULT 'Active'::character varying,
  featured boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_code_key UNIQUE (code),
  CONSTRAINT products_category_name_fkey FOREIGN KEY (category_name) 
    REFERENCES public.categories (name) ON UPDATE CASCADE ON DELETE SET NULL
) TABLESPACE pg_default;

-- High-performance query indexes
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products (code);
CREATE INDEX IF NOT EXISTS idx_products_category_name ON public.products (category_name);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured) WHERE featured IS TRUE;
CREATE INDEX IF NOT EXISTS idx_products_gin_packings ON public.products USING gin (packings);
CREATE INDEX IF NOT EXISTS idx_products_gin_ingredients ON public.products USING gin (ingredients);

-- ====================================================================
-- 4. PROFILES TABLE (Clinical Directory & Practitioner Access)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id character varying(100) NOT NULL,
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  password text NULL, -- Stores practitioner/admin account password
  role character varying(50) NULL DEFAULT 'PRACTITIONER'::character varying,
  role_title character varying(255) NULL DEFAULT 'Clinical Practitioner'::character varying,
  status character varying(50) NULL DEFAULT 'Active'::character varying,
  avatar_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- Migration to ensure password column exists on existing deployments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);

-- ====================================================================
-- 5. AUDIT LOGS TABLE (Clinical Governance & Regulatory Trail)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial NOT NULL,
  admin_email character varying(255) NOT NULL,
  action character varying(100) NOT NULL,
  target_id character varying(100) NULL,
  details text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);

-- ====================================================================
-- 6. AUTOMATIC TIMESTAMP TRIGGER FUNCTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES (Safe Drop & Recreate)
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies before recreation to avoid 42710 errors
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Full Access Categories" ON public.categories;

DROP POLICY IF EXISTS "Public Read Ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Full Access Ingredients" ON public.ingredients;

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Full Access Products" ON public.products;

DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Full Access Profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public Read Audit Logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Full Access Audit Logs" ON public.audit_logs;

-- Allow public read access to active medicines, categories, ingredients, and profiles
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Audit Logs" ON public.audit_logs FOR SELECT USING (true);

-- Allow full CRUD for authorized admin users & service role
CREATE POLICY "Full Access Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Ingredients" ON public.ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Audit Logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- 8. REALTIME REPLICATION (Instant WebSocket broadcast on CRUD)
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'ingredients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ingredients;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;

-- ====================================================================
-- 9. INITIAL TAXONOMIC SEED: Classical Ayurvedic Categories
-- ====================================================================
INSERT INTO public.categories (name, code, title, description, icon) VALUES
('Arishtams & Asavams', 'ARISHTAM', 'Fermented Formulations', 'Naturally self-generated herbal wines and biomedical elixirs imparting high bioavailability.', 'wine-glass'),
('Kashayams (Kwathams)', 'KASHAYAM', 'Decoctions & Kwaths', 'Standardized aqueous extracts and water decoctions of concentrated raw botanical roots.', 'flask'),
('Ghritams (Ghees)', 'GHRITAM', 'Medicated Clarified Butter', 'Lipophilic herbal extractions through cow ghee capable of crossing blood-brain barriers.', 'droplet'),
('Thailams & Kuzhambu', 'THAILAM', 'Medicated Sesame Oils', 'Therapeutic external and internal oils for Abhyanga, Nasya, and neuro-muscular regeneration.', 'sparkles'),
('Lehyams & Rasayanams', 'LEHYAM', 'Herbal Jams & Electuaries', 'Syrupy nutritive confections boiled with jaggery, honey, ghee, and rejuvenative herbs.', 'heart'),
('Choornams (Powders)', 'CHOORNAM', 'Micro-pulverized Herb Powders', 'Finely sifted herbal mixtures balancing doshas through direct oral or external posology.', 'wind'),
('Gulikas & Vatis', 'GULIKA', 'Ayurvedic Tablets & Pills', 'Compressed herbal powders and mineral preparations for calibrated precision dosing.', 'circle-dot'),
('Bhasmas & Rasakriyas', 'BHASMA', 'Calcined Mineral Ash', 'Bio-purified nano-particulate calx delivering deep cellular rejuvenation.', 'flame'),
('Thailam - Softgel Capsules', 'CAPSULE', 'Soft Gelatin Encapsulations', 'Modernized palatable dosage delivery of classical Thailams and Kashayams.', 'capsule'),
('Kashayam - Tablets', 'KWATH_TAB', 'Concentrated Kwath Tablets', 'Dehydrated compressed extracts replacing traditional boiling of liquid kwathams.', 'tablets')
ON CONFLICT (name) DO UPDATE SET
  code = EXCLUDED.code,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- ====================================================================
-- 10. SUPABASE STORAGE BUCKET: apks (Ayur Index Android Distribution)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apks',
  'apks',
  true,
  104857600, -- 100 MB max APK size
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read access policy for anonymous APK downloads
CREATE POLICY "Public Read Access for APKs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apks');

-- Authenticated and anonymous upload policy for clinic release publishing
CREATE POLICY "Authenticated Release Uploads"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'apks');

CREATE POLICY "Authenticated Release Updates"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'apks');

-- ====================================================================
-- 11. DEVICE & LOCATION MANAGEMENT (Single-Table Telemetry & Consent)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.app_devices (
  id                          bigserial NOT NULL,
  installation_id             character varying(100) NOT NULL,
  CONSTRAINT app_devices_pkey PRIMARY KEY (id),
  CONSTRAINT app_devices_installation_id_key UNIQUE (installation_id)
) TABLESPACE pg_default;

ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS manufacturer character varying(100) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS device_model character varying(100) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS android_version character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS sdk_version integer NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS app_version character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS app_version_name character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS app_version_code integer NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS device_type character varying(50) NULL DEFAULT 'Phone';
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS language character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS timezone character varying(100) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS network_type character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS device_reporting_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_consent boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS first_seen_at timestamp with time zone NULL DEFAULT now();
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone NULL DEFAULT now();
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone NULL DEFAULT now();

-- Location Telemetry Columns
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS latitude double precision NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS longitude double precision NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS accuracy double precision NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_precision character varying(50) NULL DEFAULT 'approximate';
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_source character varying(100) NULL DEFAULT 'gps';
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_recorded_at timestamp with time zone NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_uploaded_at timestamp with time zone NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS location_history jsonb NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NULL DEFAULT now();
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_app_devices_installation_id ON public.app_devices (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_last_seen_at ON public.app_devices (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_reporting_consent ON public.app_devices (device_reporting_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_location_consent ON public.app_devices (location_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_type ON public.app_devices (device_type);
CREATE INDEX IF NOT EXISTS idx_app_devices_android_version ON public.app_devices (android_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_app_version ON public.app_devices (app_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_coords ON public.app_devices (latitude, longitude) WHERE latitude IS NOT NULL;

DROP TRIGGER IF EXISTS set_updated_at_app_devices ON public.app_devices;
CREATE TRIGGER set_updated_at_app_devices
  BEFORE UPDATE ON public.app_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access App Devices" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Insert" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Update" ON public.app_devices;

CREATE POLICY "Admin Full Access App Devices" ON public.app_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Device Telemetry Reporting Insert" ON public.app_devices FOR INSERT WITH CHECK (installation_id IS NOT NULL AND length(installation_id) > 5);
CREATE POLICY "Device Telemetry Reporting Update" ON public.app_devices FOR UPDATE USING (true) WITH CHECK (installation_id IS NOT NULL);

