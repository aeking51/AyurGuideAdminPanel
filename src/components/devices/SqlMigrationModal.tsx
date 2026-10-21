import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, ShieldAlert } from 'lucide-react';

interface SqlMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIGRATION_SQL = `-- ====================================================================
-- AyurIndex — Device & Location Records Schema Migration
-- Execute in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. APP_DEVICES TABLE
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

CREATE INDEX IF NOT EXISTS idx_app_devices_installation_id ON public.app_devices (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_last_seen_at ON public.app_devices (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_devices_location_consent ON public.app_devices (location_consent);

-- 2. APP_DEVICE_LOCATIONS TABLE
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

CREATE INDEX IF NOT EXISTS idx_app_device_locations_installation_id ON public.app_device_locations (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_device_locations_recorded_at ON public.app_device_locations (recorded_at DESC);

-- 3. AUTOMATIC UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS set_updated_at_app_devices ON public.app_devices;
CREATE TRIGGER set_updated_at_app_devices
  BEFORE UPDATE ON public.app_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_device_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access App Devices" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Insert" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Update" ON public.app_devices;
DROP POLICY IF EXISTS "Admin Full Access App Device Locations" ON public.app_device_locations;
DROP POLICY IF EXISTS "Device Location Reporting Insert" ON public.app_device_locations;

CREATE POLICY "Admin Full Access App Devices" ON public.app_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Device Telemetry Reporting Insert" ON public.app_devices FOR INSERT WITH CHECK (installation_id IS NOT NULL AND length(installation_id) > 5);
CREATE POLICY "Device Telemetry Reporting Update" ON public.app_devices FOR UPDATE USING (true) WITH CHECK (installation_id IS NOT NULL);
CREATE POLICY "Admin Full Access App Device Locations" ON public.app_device_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Device Location Reporting Insert" ON public.app_device_locations FOR INSERT WITH CHECK (installation_id IS NOT NULL);

-- 5. REALTIME REPLICATION
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
END $$;`;

export const SqlMigrationModal: React.FC<SqlMigrationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#081C13] border border-[#23493C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#23493C] bg-gradient-to-r from-[#0D281C] to-[#081C13] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-100 font-serif">
                Supabase SQL Migration — Device & Location Records
              </h3>
              <p className="text-xs text-emerald-400/80">
                Idempotent PostgreSQL script to provision <code className="font-mono text-emerald-300">public.app_devices</code> and <code className="font-mono text-emerald-300">public.app_device_locations</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#0D281C] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-[#0D281C] border border-[#23493C] rounded-xl p-4 text-xs text-gray-300 space-y-2">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>How to Apply in 30 Seconds:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-300 pl-1">
              <li>Open your <a href="https://supabase.com/dashboard/project/ksnsfilauqzxsegpjpdt/sql" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold inline-flex items-center gap-1">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Click <strong>New Query</strong>.</li>
              <li>Click the <strong>Copy SQL Script</strong> button below and paste it into the editor.</li>
              <li>Click <strong>Run</strong>. The tables, foreign keys, RLS policies, and realtime broadcast will be created instantly.</li>
            </ol>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between bg-[#061810] px-4 py-2 border border-[#23493C] rounded-t-xl text-xs text-gray-400">
              <span className="font-mono text-emerald-400">supabase_device_location_migration.sql</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#05140D] border border-t-0 border-[#23493C] rounded-b-xl text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-80 leading-relaxed">
              {MIGRATION_SQL}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#23493C] bg-[#061810] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#0D281C] hover:bg-[#133829] border border-[#23493C] text-gray-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
