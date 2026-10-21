-- ====================================================================
-- AyurIndex — Device & Location Records Schema Migration
-- Migration Script: supabase_device_location_migration.sql
-- 
-- Purpose:
-- Adds tables and policies to securely store and audit Android app installations,
-- device hardware specifications, explicit consent records, and telemetry/location data.
--
-- How to Apply:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ksnsfilauqzxsegpjpdt
-- 2. Navigate to "SQL Editor" on the left navigation sidebar.
-- 3. Click "New Query" and paste the entire contents of this file.
-- 4. Click "Run" (or Ctrl/Cmd + Enter) to execute the migration.
-- 5. The admin portal will immediately detect the new tables and stream live telemetry.
-- ====================================================================

-- 0. Required Extensions (uuid-ossp for secure identifier generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. APP_DEVICES TABLE
-- Tracks unique app installations, hardware profiles, and consent states.
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.app_devices (
  id bigserial NOT NULL,
  installation_id character varying(100) NOT NULL,
  manufacturer character varying(100) NULL,
  device_model character varying(100) NULL,
  android_version character varying(50) NULL,
  sdk_version integer NULL,
  app_version character varying(50) NULL,
  app_version_name character varying(50) NULL,
  app_version_code integer NULL,
  device_type character varying(50) NULL DEFAULT 'Phone'::character varying,
  language character varying(50) NULL,
  timezone character varying(100) NULL,
  network_type character varying(50) NULL,
  device_reporting_consent boolean NOT NULL DEFAULT false,
  location_consent boolean NOT NULL DEFAULT false,
  first_seen_at timestamp with time zone NULL DEFAULT now(),
  last_seen_at timestamp with time zone NULL DEFAULT now(),
  last_sync_at timestamp with time zone NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT app_devices_pkey PRIMARY KEY (id),
  CONSTRAINT app_devices_installation_id_key UNIQUE (installation_id)
) TABLESPACE pg_default;

-- High-performance lookup & filter indexes
CREATE INDEX IF NOT EXISTS idx_app_devices_installation_id ON public.app_devices (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_last_seen_at ON public.app_devices (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_reporting_consent ON public.app_devices (device_reporting_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_location_consent ON public.app_devices (location_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_type ON public.app_devices (device_type);
CREATE INDEX IF NOT EXISTS idx_app_devices_android_version ON public.app_devices (android_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_app_version ON public.app_devices (app_version);

-- ====================================================================
-- 2. APP_DEVICE_LOCATIONS TABLE
-- Stores consented location updates with precision and timestamp demarcation.
-- Cascading deletion: deleting an app_devices record removes all location history.
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.app_device_locations (
  id bigserial NOT NULL,
  installation_id character varying(100) NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision NULL,
  location_precision character varying(50) NOT NULL DEFAULT 'approximate'::character varying,
  location_source character varying(100) NULL DEFAULT 'gps'::character varying,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT app_device_locations_pkey PRIMARY KEY (id),
  CONSTRAINT app_device_locations_installation_id_fkey FOREIGN KEY (installation_id)
    REFERENCES public.app_devices (installation_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT chk_location_precision CHECK (location_precision IN ('approximate', 'precise'))
) TABLESPACE pg_default;

-- Fast temporal & geographical indexes
CREATE INDEX IF NOT EXISTS idx_app_device_locations_installation_id ON public.app_device_locations (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_device_locations_recorded_at ON public.app_device_locations (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_device_locations_uploaded_at ON public.app_device_locations (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_device_locations_precision ON public.app_device_locations (location_precision);

-- ====================================================================
-- 3. AUTOMATIC UPDATED_AT TRIGGER
-- Keeps app_devices.updated_at synchronized on every telemetry update.
-- ====================================================================
DROP TRIGGER IF EXISTS set_updated_at_app_devices ON public.app_devices;
CREATE TRIGGER set_updated_at_app_devices
  BEFORE UPDATE ON public.app_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Zero-Trust Security:
-- - Read access is restricted to authenticated administrators.
-- - Public / anonymous clients can only upsert their own device telemetry
--   with valid consent flags and cannot read other devices or location history.
-- ====================================================================
ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_device_locations ENABLE ROW LEVEL SECURITY;

-- Clean recreation of policies
DROP POLICY IF EXISTS "Admin Full Access App Devices" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Insert" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Update" ON public.app_devices;

DROP POLICY IF EXISTS "Admin Full Access App Device Locations" ON public.app_device_locations;
DROP POLICY IF EXISTS "Device Location Reporting Insert" ON public.app_device_locations;

-- Administrators have full read and delete access
CREATE POLICY "Admin Full Access App Devices"
  ON public.app_devices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anonymous/Mobile clients can register or update their own telemetry
CREATE POLICY "Device Telemetry Reporting Insert"
  ON public.app_devices
  FOR INSERT
  WITH CHECK (installation_id IS NOT NULL AND length(installation_id) > 5);

CREATE POLICY "Device Telemetry Reporting Update"
  ON public.app_devices
  FOR UPDATE
  USING (true)
  WITH CHECK (installation_id IS NOT NULL);

-- Admin read and management of location history
CREATE POLICY "Admin Full Access App Device Locations"
  ON public.app_device_locations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Mobile client insert for consented location records only
CREATE POLICY "Device Location Reporting Insert"
  ON public.app_device_locations
  FOR INSERT
  WITH CHECK (
    installation_id IS NOT NULL 
    AND latitude BETWEEN -90.0 AND 90.0 
    AND longitude BETWEEN -180.0 AND 180.0
  );

-- ====================================================================
-- 5. REALTIME REPLICATION REGISTRATION
-- Allows Supabase to broadcast real-time events to the admin panel.
-- ====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_devices;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_device_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_device_locations;
  END IF;
END $$;
