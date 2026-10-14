import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  Search, 
  TableProperties, 
  Check, 
  ExternalLink,
  Layers,
  Activity,
  HardDrive,
  Smartphone,
  Upload,
  Radio
} from 'lucide-react';
import { SupabaseConfig } from '../../types';
import { SupabaseService } from '../../services/supabase';
import { StorageService } from '../../services/storage';
import { ReleaseManagerModal } from '../admin/ReleaseManagerModal';
import { APK_CONFIG } from '../../config/apkConfig';

interface DatabaseViewProps {
  config: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => void;
  onReloadAllData?: () => void;
}

interface TableCount {
  name: string;
  count: number;
  status: 'Synced' | 'Accessible' | 'Checking';
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [url, setUrl] = useState(config.url || 'https://ksnsfilauqzxsegpjpdt.supabase.co');
  const [key, setKey] = useState(config.key || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  // Disaster Recovery / Read-only Inspection States
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    healthy: boolean;
    timestamp: string;
    metrics: { label: string; value: string | number; ok: boolean }[];
    notes: string[];
  } | null>(null);
  
  const [tableStats, setTableStats] = useState<TableCount[]>([
    { name: 'public.products', count: 0, status: 'Checking' },
    { name: 'public.categories', count: 0, status: 'Checking' },
    { name: 'public.ingredients', count: 0, status: 'Checking' },
    { name: 'public.profiles', count: 0, status: 'Checking' },
    { name: 'public.audit_logs', count: 0, status: 'Checking' },
  ]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch read-only table statistics without altering database
  const loadDatabaseStats = async () => {
    setIsLoadingStats(true);
    try {
      const client = SupabaseService.getClient();
      if (client) {
        const [prodRes, catRes, ingRes, profRes, logRes] = await Promise.all([
          client.from('products').select('id', { count: 'exact', head: true }),
          client.from('categories').select('id', { count: 'exact', head: true }),
          client.from('ingredients').select('id', { count: 'exact', head: true }),
          client.from('profiles').select('id', { count: 'exact', head: true }),
          client.from('audit_logs').select('id', { count: 'exact', head: true }),
        ]);

        setTableStats([
          { 
            name: 'public.products', 
            count: prodRes.count ?? StorageService.getProducts().length, 
            status: prodRes.error ? 'Accessible' : 'Synced' 
          },
          { 
            name: 'public.categories', 
            count: catRes.count ?? StorageService.getCategories().length, 
            status: catRes.error ? 'Accessible' : 'Synced' 
          },
          { 
            name: 'public.ingredients', 
            count: ingRes.count ?? StorageService.getBotanicalIngredients().length, 
            status: ingRes.error ? 'Accessible' : 'Synced' 
          },
          { 
            name: 'public.profiles', 
            count: profRes.count ?? StorageService.getUsers().length, 
            status: profRes.error ? 'Accessible' : 'Synced' 
          },
          { 
            name: 'public.audit_logs', 
            count: logRes.count ?? StorageService.getAuditLogs().length, 
            status: logRes.error ? 'Accessible' : 'Synced' 
          },
        ]);
      } else {
        setTableStats([
          { name: 'public.products', count: StorageService.getProducts().length, status: 'Accessible' },
          { name: 'public.categories', count: StorageService.getCategories().length, status: 'Accessible' },
          { name: 'public.ingredients', count: StorageService.getBotanicalIngredients().length, status: 'Accessible' },
          { name: 'public.profiles', count: StorageService.getUsers().length, status: 'Accessible' },
          { name: 'public.audit_logs', count: StorageService.getAuditLogs().length, status: 'Accessible' },
        ]);
      }
    } catch {
      // Fallback to local counts
      setTableStats([
        { name: 'public.products', count: StorageService.getProducts().length, status: 'Accessible' },
        { name: 'public.categories', count: StorageService.getCategories().length, status: 'Accessible' },
        { name: 'public.ingredients', count: StorageService.getBotanicalIngredients().length, status: 'Accessible' },
        { name: 'public.profiles', count: StorageService.getUsers().length, status: 'Accessible' },
        { name: 'public.audit_logs', count: StorageService.getAuditLogs().length, status: 'Accessible' },
      ]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDatabaseStats();
  }, []);

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
        loadDatabaseStats();
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
      if (res.success) {
        loadDatabaseStats();
      }
    } finally {
      setSyncing(false);
    }
  };

  // 1. Download JSON Snapshot (Read-Only: does not alter database)
  const handleDownloadSnapshot = () => {
    setIsExportingJson(true);
    try {
      const jsonBackup = StorageService.exportFullBackup();
      const blob = new Blob([jsonBackup], { type: 'application/json;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ayur_index_snapshot_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } finally {
      setTimeout(() => setIsExportingJson(false), 800);
    }
  };

  // 2. Export Products CSV for Spreadsheet Analysis (Read-Only: does not alter database)
  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      const products = StorageService.getProducts();
      const headers = ['ID', 'Code', 'Name', 'Category', 'Classical Reference', 'Dosage', 'Indications', 'Status', 'Updated At'];
      const rows = products.map(p => [
        p.id,
        `"${(p.code || '').replace(/"/g, '""')}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.categoryName || '').replace(/"/g, '""')}"`,
        `"${(p.classicalReference || '').replace(/"/g, '""')}"`,
        `"${(p.dosage || p.usage || '').replace(/"/g, '""')}"`,
        `"${(p.indications || '').replace(/"/g, '""')}"`,
        p.status,
        p.updatedAt || p.createdAt || ''
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ayur_index_products_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 800);
    }
  };

  // 3. Verify Database Integrity & Health (Read-Only: does not alter database)
  const handleVerifyIntegrity = async () => {
    setIsVerifyingIntegrity(true);
    try {
      const products = StorageService.getProducts();
      const categories = StorageService.getCategories();
      const users = StorageService.getUsers();
      
      const missingSlugs = products.filter(p => !p.publicSlug).length;
      const missingCategories = products.filter(p => !p.categoryName).length;
      const inactiveCount = products.filter(p => p.status === 'Inactive').length;
      const activePractitioners = users.filter(u => u.status === 'Active').length;

      setIntegrityReport({
        healthy: missingSlugs === 0 && missingCategories === 0,
        timestamp: new Date().toLocaleTimeString(),
        metrics: [
          { label: 'Products Verified', value: products.length, ok: products.length > 0 },
          { label: 'Categories Defined', value: categories.length, ok: categories.length > 0 },
          { label: 'Canonical Slugs Formatted', value: `${products.length - missingSlugs}/${products.length}`, ok: missingSlugs === 0 },
          { label: 'Assigned Categories', value: `${products.length - missingCategories}/${products.length}`, ok: missingCategories === 0 },
          { label: 'Active Clinical Staff', value: activePractitioners, ok: activePractitioners > 0 },
          { label: 'Archived / Inactive Products', value: inactiveCount, ok: true },
        ],
        notes: [
          missingSlugs === 0 ? 'All formulations have valid web public slugs.' : 'Some items need slug regeneration.',
          missingCategories === 0 ? 'All medicines are correctly mapped to taxonomy groups.' : 'Some medicines lack categories.',
          'Database read-only integrity verification completed without schema modification.'
        ]
      });
    } finally {
      setIsVerifyingIntegrity(false);
    }
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
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Test Connection & Save</span>
          </button>

          <button
            onClick={handleLiveSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
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

      {/* Dispensary Database Snapshot & Disaster Recovery (Read-Only / Safe Non-Altering Options) */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23493C] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif font-bold text-base text-gray-100">
                Dispensary Database Snapshot & Disaster Recovery
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Safely inspect, archive, and verify dispensary database state without modifying or writing any database records.
            </p>
          </div>
          
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/80 text-[10px] text-emerald-300 font-mono w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Read-Only &bull; Zero DB Alteration</span>
          </span>
        </div>

        {/* Grid of Safe, Non-Altering Database Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Option 1: Download JSON Snapshot (Safe, read-only backup) */}
          <div className="bg-[#081C13] border border-[#23493C] rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>JSON Database Snapshot</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                Export an immutable, standalone JSON archive containing all products, categories, staff, and audit trails.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSnapshot}
              disabled={isExportingJson}
              className="w-full py-2 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingJson ? 'Generating JSON...' : 'Download Snapshot'}</span>
            </button>
          </div>

          {/* Option 2: Export CSV Spreadsheet (Safe, read-only tabular export) */}
          <div className="bg-[#081C13] border border-[#23493C] rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Spreadsheet CSV Export</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                Export products and classical formulation references as a CSV table for external offline reporting and spreadsheet audit.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="w-full py-2 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExportingCsv ? 'Exporting CSV...' : 'Export Products CSV'}</span>
            </button>
          </div>

          {/* Option 3: Verify Integrity & Diagnostics (Safe, read-only diagnostic check) */}
          <div className="bg-[#081C13] border border-[#23493C] rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Integrity & Health Check</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                Run read-only consistency checks for orphaned categories, missing canonical slugs, and inactive clinical records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleVerifyIntegrity}
              disabled={isVerifyingIntegrity}
              className="w-full py-2 px-3 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isVerifyingIntegrity ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Verify Integrity</span>
            </button>
          </div>

        </div>

        {/* Option 4: Read-Only Schema & Live Row Inspection Table */}
        <div className="bg-[#081C13] border border-[#23493C] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
              <TableProperties className="w-4 h-4 text-emerald-400" />
              <span>Live Database Tables & Record Volume (Read-Only)</span>
            </div>
            <button
              type="button"
              onClick={loadDatabaseStats}
              disabled={isLoadingStats}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
              title="Refresh record counts without altering data"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
            {tableStats.map((tbl) => (
              <div key={tbl.name} className="bg-[#0D281C]/80 border border-[#23493C]/70 rounded-lg p-2.5">
                <span className="text-[10px] font-mono text-gray-400 block truncate" title={tbl.name}>
                  {tbl.name}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-bold font-mono text-emerald-300">
                    {tbl.count.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-500/80 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/40">
                    {tbl.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integrity Report Modal / Card */}
        {integrityReport && (
          <div className="bg-[#081C13] border border-emerald-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#23493C] pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Integrity Verification Report ({integrityReport.timestamp})</span>
              </div>
              <button
                type="button"
                onClick={() => setIntegrityReport(null)}
                className="text-[10px] text-gray-400 hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {integrityReport.metrics.map((m, idx) => (
                <div key={idx} className="bg-[#0D281C] border border-[#23493C]/50 rounded-lg p-2">
                  <span className="text-[10px] text-gray-400 block">{m.label}</span>
                  <span className={`text-xs font-mono font-bold mt-0.5 block ${m.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1">
              {integrityReport.notes.map((note, idx) => (
                <p key={idx} className="text-[11px] text-gray-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* APK Cloud Hosting & Release Distribution (Supabase Storage) */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23493C] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-100">
                Ayur Index Android APK Cloud Distribution
              </h3>
              <p className="text-xs text-gray-400">
                Host, version, and distribute the official Android APK directly via Supabase Storage bucket (<code className="text-emerald-300 font-mono">apks</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReleaseModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Manage APK Releases</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C] space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Active Release Version</span>
            <span className="font-bold text-emerald-300 text-sm font-mono flex items-center gap-1.5">
              <span>{APK_CONFIG.version}</span>
              <span className="text-[10px] text-gray-400 font-normal">({APK_CONFIG.fileSize})</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C] space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Primary Cloud CDN Target</span>
            <span className="font-semibold text-white text-xs truncate block font-mono" title={APK_CONFIG.supabaseLatestApkUrl}>
              {APK_CONFIG.supabaseStorageBucket}/Latest_App/AyurIndex.apk
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#081C13] border border-[#23493C] space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">Clinic QR Strategy</span>
            <span className="font-semibold text-emerald-400 text-xs block">
              Permanent Latest Redirect
            </span>
          </div>
        </div>
      </div>

      {/* Release Manager Modal */}
      {isReleaseModalOpen && (
        <ReleaseManagerModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
        />
      )}

    </div>
  );
};

