-- ====================================================================
-- AyurIndex — Fail-Safe Single-Table Device & Location Telemetry Schema
-- Migration Script: supabase_device_location_migration.sql
-- Table: public.app_devices (Hardware profile + Consented GPS coordinates)
--
-- Safe to execute even if public.app_devices was already created previously.
-- ====================================================================

-- 0. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. BASE TABLE CREATION (If not exists)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.app_devices (
  id                          bigserial NOT NULL,
  installation_id             character varying(100) NOT NULL,
  CONSTRAINT app_devices_pkey PRIMARY KEY (id),
  CONSTRAINT app_devices_installation_id_key UNIQUE (installation_id)
) TABLESPACE pg_default;

-- ====================================================================
-- 2. ENSURE ALL COLUMNS EXIST (Handles existing table upgrades)
-- ====================================================================
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

-- ====================================================================
-- 3. INDEXES (Safe to create now that all columns are guaranteed)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_app_devices_installation_id ON public.app_devices (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_last_seen_at ON public.app_devices (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_reporting_consent ON public.app_devices (device_reporting_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_location_consent ON public.app_devices (location_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_type ON public.app_devices (device_type);
CREATE INDEX IF NOT EXISTS idx_app_devices_android_version ON public.app_devices (android_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_app_version ON public.app_devices (app_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_coords ON public.app_devices (latitude, longitude) WHERE latitude IS NOT NULL;

-- ====================================================================
-- 4. AUTOMATIC UPDATED_AT TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_app_devices ON public.app_devices;
CREATE TRIGGER set_updated_at_app_devices
  BEFORE UPDATE ON public.app_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access App Devices" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Insert" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Update" ON public.app_devices;

CREATE POLICY "Admin Full Access App Devices"
  ON public.app_devices
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Device Telemetry Reporting Insert"
  ON public.app_devices
  FOR INSERT
  WITH CHECK (installation_id IS NOT NULL AND length(installation_id) > 5);

CREATE POLICY "Device Telemetry Reporting Update"
  ON public.app_devices
  FOR UPDATE
  USING (true)
  WITH CHECK (installation_id IS NOT NULL);

-- ====================================================================
-- 6. REALTIME REPLICATION REGISTRATION
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_devices;
  END IF;
END $$;
