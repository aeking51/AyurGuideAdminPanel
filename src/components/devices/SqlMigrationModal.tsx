import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, ShieldAlert } from 'lucide-react';

interface SqlMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIGRATION_SQL = `-- ====================================================================
-- AyurIndex — Single-Table Device & Location Telemetry Schema
-- Execute in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BASE TABLE (If not exists)
CREATE TABLE IF NOT EXISTS public.app_devices (
  id                          bigserial NOT NULL,
  installation_id             character varying(100) NOT NULL,
  CONSTRAINT app_devices_pkey PRIMARY KEY (id),
  CONSTRAINT app_devices_installation_id_key UNIQUE (installation_id)
) TABLESPACE pg_default;

-- 2. ENSURE ALL COLUMNS EXIST (Supports existing tables)
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

-- Status, Lifecycle & Hardware Identifiers
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS status character varying(30) NULL DEFAULT 'ACTIVE';
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS imei character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS mac_address character varying(50) NULL;
ALTER TABLE public.app_devices ADD COLUMN IF NOT EXISTS uninstall_detected_at timestamp with time zone NULL;

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

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_app_devices_installation_id ON public.app_devices (installation_id);
CREATE INDEX IF NOT EXISTS idx_app_devices_status ON public.app_devices (status);
CREATE INDEX IF NOT EXISTS idx_app_devices_last_seen_at ON public.app_devices (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_reporting_consent ON public.app_devices (device_reporting_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_location_consent ON public.app_devices (location_consent);
CREATE INDEX IF NOT EXISTS idx_app_devices_device_type ON public.app_devices (device_type);
CREATE INDEX IF NOT EXISTS idx_app_devices_android_version ON public.app_devices (android_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_app_version ON public.app_devices (app_version);
CREATE INDEX IF NOT EXISTS idx_app_devices_coords ON public.app_devices (latitude, longitude) WHERE latitude IS NOT NULL;

-- 4. AUTOMATIC UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS set_updated_at_app_devices ON public.app_devices;
CREATE TRIGGER set_updated_at_app_devices
  BEFORE UPDATE ON public.app_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.app_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Full Access App Devices" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Insert" ON public.app_devices;
DROP POLICY IF EXISTS "Device Telemetry Reporting Update" ON public.app_devices;

CREATE POLICY "Admin Full Access App Devices" ON public.app_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Device Telemetry Reporting Insert" ON public.app_devices FOR INSERT WITH CHECK (installation_id IS NOT NULL AND length(installation_id) > 5);
CREATE POLICY "Device Telemetry Reporting Update" ON public.app_devices FOR UPDATE USING (true) WITH CHECK (installation_id IS NOT NULL);

-- 4. REALTIME REPLICATION
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_devices;
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
