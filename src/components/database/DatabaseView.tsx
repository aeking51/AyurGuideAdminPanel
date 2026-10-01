import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Download, Upload, ShieldCheck, KeyRound, Copy, Check } from 'lucide-react';
import { SupabaseConfig } from '../../types';
import { SupabaseService } from '../../services/supabase';
import { StorageService } from '../../services/storage';

interface DatabaseViewProps {
  config: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => void;
  onReloadAllData: () => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  config,
  onSaveConfig,
  onReloadAllData,
}) => {
  const [url, setUrl] = useState(config.url || 'https://ksnsfilauqzxsegpjpdt.supabase.co');
  const [key, setKey] = useState(config.key || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await SupabaseService.testConnection(url.trim(), key.trim());
      setTestResult(res);
      if (res.success) {
        onSaveConfig({
          url: url.trim(),
          key: key.trim(),
          connected: true,
          lastSyncTime: new Date().toISOString()
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const handleLiveSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await SupabaseService.syncToCloud();
      setSyncResult(res);
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ayurguide_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        alert('Database snapshot restored successfully!');
        onReloadAllData();
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Supabase Cloud PostgreSQL Database</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Synchronize products, formulation categories, and clinical practitioner roles between this React Administrative Web Portal and your cloud PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081C13] border border-[#23493C] text-xs font-mono text-emerald-300">
          <div className={`w-2 h-2 rounded-full ${config.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{config.connected ? 'Cloud Active' : 'Offline / Local'}</span>
        </div>
      </div>

      {/* Supabase Credentials Box */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-serif font-bold text-base text-gray-100 border-b border-[#23493C] pb-2">
          Cloud Project Connection Settings
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-emerald-300 mb-1">Supabase Project URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ksnsfilauqzxsegpjpdt.supabase.co"
              className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-emerald-300 mb-1">Anon / Service Role Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Configured via Supabase Dashboard &gt; Project Settings &gt; API.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Connection & Save</span>
          </button>

          <button
            onClick={handleLiveSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Sync Medicines to Cloud</span>
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            testResult.success ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-red-950/80 text-red-300 border border-red-800'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Sync Result Message */}
        {syncResult && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            syncResult.success ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-red-950/80 text-red-300 border border-red-800'
          }`}>
            {syncResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{syncResult.message}</span>
          </div>
        )}
      </div>

      {/* Database Schema & Password Column Migration */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#23493C] pb-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-gray-100">
              Database Password Column (public.profiles.password)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full">
            Database Column Ready
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          The admin panel stores and updates passwords in the <code className="text-emerald-300 font-mono">password</code> column of the <code className="text-emerald-300 font-mono">public.profiles</code> table. If your remote Supabase instance does not have this column yet, run this one-line SQL migration in your Supabase SQL Editor:
        </p>

        <div className="relative bg-[#081C13] border border-[#23493C] rounded-xl p-3.5 font-mono text-xs text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <code className="text-emerald-200 select-all">ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text NULL;</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password text NULL;');
              setCopiedSql(true);
              setTimeout(() => setCopiedSql(false), 2000);
            }}
            className="px-3 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 text-xs flex items-center gap-1.5 border border-emerald-700/60 transition cursor-pointer self-start sm:self-center shrink-0"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Migration'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot Backup & Restore */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-serif font-bold text-base text-gray-100 border-b border-[#23493C] pb-2">
          Dispensary Database Snapshot & Disaster Recovery
        </h3>
        <p className="text-xs text-gray-400">
          Export a complete, self-contained JSON backup containing all 28 formulation categories, medicines, stock allocations, and audit logs.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 hover:text-white hover:bg-emerald-950 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download JSON Snapshot</span>
          </button>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 hover:text-white hover:bg-emerald-950 text-xs font-semibold flex items-center gap-2 transition">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Restore Backup JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
};
