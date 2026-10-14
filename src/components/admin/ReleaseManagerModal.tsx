import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Terminal, 
  Database,
  FileCode,
  Download,
  Clock,
  Edit2,
  Save,
  RotateCcw,
  Power,
  Activity,
  Plus,
  Trash2,
  Globe,
  Star,
  Sliders,
  CheckCircle,
  HelpCircle,
  Link as LinkIcon
} from 'lucide-react';
import { APK_CONFIG } from '../../config/apkConfig';
import { ApkStorageService, StorageStatusResult } from '../../services/apkStorageService';
import { ApkLinkManagerService, ManagedApkLink } from '../../services/apkLinkManagerService';

interface ReleaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseManagerModal: React.FC<ReleaseManagerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'upload' | 'sql' | 'archive'>('status');
  const [statusResult, setStatusResult] = useState<StorageStatusResult | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Managed Links State (Supabase, Vercel & Custom mirrors)
  const [managedLinks, setManagedLinks] = useState<ManagedApkLink[]>(() => ApkLinkManagerService.getLinks());
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<string>('');
  const [testingLinkId, setTestingLinkId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [id: string]: { isReachable: boolean; latencyMs: number; statusText: string } }>({});
  
  // Custom mirror creation state
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customDesc, setCustomDesc] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [versionTag, setVersionTag] = useState<string>(APK_CONFIG.version);
  const [calculatedSha256, setCalculatedSha256] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; latestUrl?: string } | null>(null);

  // Subscribe to live link updates
  useEffect(() => {
    const unsubscribe = ApkLinkManagerService.subscribe((links) => {
      setManagedLinks(links);
    });
    return unsubscribe;
  }, []);

  const handleToggleActive = (id: string) => {
    const updated = ApkLinkManagerService.toggleLinkActive(id);
    setManagedLinks(updated);
    const link = updated.find(l => l.id === id);
    setFeedbackMessage(`Link "${link?.name}" is now ${link?.isActive ? 'Active' : 'Inactive'}.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSetPrimary = (id: string) => {
    const updated = ApkLinkManagerService.setPrimaryLink(id);
    setManagedLinks(updated);
    const link = updated.find(l => l.id === id);
    setFeedbackMessage(`"${link?.name}" is now the Primary Download Route.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleStartEdit = (link: ManagedApkLink) => {
    setEditingLinkId(link.id);
    setEditingUrl(link.url);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      alert('Please enter a valid URL starting with https:// or http://');
      return;
    }
    const updated = ApkLinkManagerService.updateLinkUrl(id, trimmed);
    setManagedLinks(updated);
    setEditingLinkId(null);
    setFeedbackMessage('Link URL updated successfully.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditingUrl('');
  };

  const handleResetLink = (id: string) => {
    const updated = ApkLinkManagerService.resetLinkUrl(id);
    setManagedLinks(updated);
    if (editingLinkId === id) {
      setEditingLinkId(null);
    }
    setFeedbackMessage('Link URL reset to default.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleTestLink = async (id: string) => {
    setTestingLinkId(id);
    try {
      const res = await ApkLinkManagerService.testLinkReachability(id);
      setTestResults(prev => ({ ...prev, [id]: res }));
    } finally {
      setTestingLinkId(null);
    }
  };

  const handleResetAllLinks = () => {
    if (confirm('Reset all Supabase & Vercel links back to factory defaults?')) {
      const defaults = ApkLinkManagerService.resetAllToDefaults();
      setManagedLinks(defaults);
      setEditingLinkId(null);
      setFeedbackMessage('All distribution links reset to official defaults.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleAddCustomMirror = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      alert('Please enter a valid URL starting with https:// or http://');
      return;
    }
    const updated = ApkLinkManagerService.addCustomLink(customName || 'Custom Mirror', trimmed, customDesc);
    setManagedLinks(updated);
    setCustomName('');
    setCustomUrl('');
    setCustomDesc('');
    setIsAddingCustom(false);
    setFeedbackMessage('Custom mirror added.');
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleRemoveCustomMirror = (id: string) => {
    if (confirm('Remove this custom mirror link?')) {
      const updated = ApkLinkManagerService.removeCustomLink(id);
      setManagedLinks(updated);
      setFeedbackMessage('Custom mirror removed.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const checkStatus = () => {
    setIsCheckingStatus(true);
    ApkStorageService.checkCloudReleaseStatus()
      .then(res => setStatusResult(res))
      .finally(() => setIsCheckingStatus(false));
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2500);
    });
  };

  const handleCopySql = () => {
    const sql = ApkStorageService.getStorageSetupSql();
    navigator.clipboard.writeText(sql).then(() => {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadResult(null);
      const hash = await ApkStorageService.calculateFileSha256(file);
      setCalculatedSha256(hash);
    }
  };

  const handlePerformUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const res = await ApkStorageService.uploadApkToStorage(
      uploadFile,
      versionTag,
      (p) => setUploadProgress(p)
    );

    setIsUploading(false);
    setUploadResult(res);
    if (res.success) {
      checkStatus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div 
        className="relative w-full max-w-3xl bg-[#0D281C] border border-[#23493C] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#23493C]/80 bg-[#081C13]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 flex items-center justify-center text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg font-serif">
                  Ayur Index APK Cloud Hosting
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Supabase Storage
                </span>
              </div>
              <p className="text-xs text-emerald-400/80">
                Manage global CDN delivery, automated latest pointer, and versioned archive files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#23493C]/80 bg-[#081C13]/60 px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Cloud CDN Status</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Publish New Release</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Version Archive ({APK_CONFIG.archiveReleases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Bucket Setup SQL</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: CDN STATUS & ENDPOINTS */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              
              {/* CDN Health Banner */}
              <div className="p-4 rounded-2xl bg-[#081C13] border border-[#23493C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    statusResult?.latestFileReachable
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {statusResult?.latestFileReachable ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {statusResult ? statusResult.message : 'Checking Supabase Storage CDN...'}
                    </h4>
                    <p className="text-xs text-gray-400">
                      Bucket: <span className="font-mono text-emerald-300">{APK_CONFIG.supabaseStorageBucket}</span> &bull; Strategy: Automated Latest Pointer
                    </p>
                  </div>
                </div>

                <button
                  onClick={checkStatus}
                  disabled={isCheckingStatus}
                  className="py-1.5 px-3 bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>Re-check CDN</span>
                </button>
              </div>

              {/* Feedback Toast */}
              {feedbackMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </div>
                  <button 
                    onClick={() => setFeedbackMessage(null)}
                    className="text-emerald-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Endpoint URLs & CDN Link Management */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23493C]/80 pb-2.5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-mono flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Manage Cloud CDN Endpoints (Supabase &amp; Vercel)
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Edit URLs, activate or inactivate download mirrors, and assign the primary route for mobile QR codes.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => setIsAddingCustom(!isAddingCustom)}
                      className="py-1 px-2.5 rounded-lg bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] text-[11px] flex items-center gap-1 font-medium transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingCustom ? 'Cancel Add' : 'Add Mirror'}</span>
                    </button>
                    
                    <button
                      onClick={handleResetAllLinks}
                      className="py-1 px-2.5 rounded-lg bg-[#081C13] hover:bg-[#143022] text-gray-300 hover:text-white border border-[#23493C] text-[11px] flex items-center gap-1 font-medium transition"
                      title="Reset all links to official Supabase & Vercel defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>
                </div>

                {/* Optional Custom Mirror Add Form */}
                {isAddingCustom && (
                  <form onSubmit={handleAddCustomMirror} className="p-4 rounded-xl bg-[#081C13] border border-emerald-500/50 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add New Distribution Mirror
                      </span>
                      <button type="button" onClick={() => setIsAddingCustom(false)} className="text-gray-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Mirror Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Cloudflare R2 / AWS S3 Mirror"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full bg-[#061810] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Global CDN edge mirror"
                          value={customDesc}
                          onChange={(e) => setCustomDesc(e.target.value)}
                          className="w-full bg-[#061810] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Direct APK Download URL (HTTPS)</label>
                      <input
                        type="url"
                        placeholder="https://example.com/storage/AyurIndex.apk"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="w-full bg-[#061810] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(false)}
                        className="py-1 px-3 rounded-lg border border-[#23493C] text-gray-300 text-xs hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-1 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Mirror</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Managed Links */}
                <div className="space-y-3.5">
                  {managedLinks.map((link) => {
                    const isEditing = editingLinkId === link.id;
                    const isTesting = testingLinkId === link.id;
                    const testResult = testResults[link.id];

                    return (
                      <div 
                        key={link.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          link.isActive 
                            ? (link.isPrimary ? 'bg-[#081C13] border-emerald-500/60 shadow-lg' : 'bg-[#081C13]/90 border-[#23493C]') 
                            : 'bg-[#06140E]/60 border-red-900/30 opacity-75'
                        }`}
                      >
                        {/* Header Row: Title, Badges, Status & Toggle */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className={`w-2.5 h-2.5 rounded-full ${link.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            <h5 className="font-semibold text-white text-sm">
                              {link.name}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                              {link.badge}
                            </span>

                            {link.isPrimary ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold flex items-center gap-1 shadow-sm">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Primary Download Route
                              </span>
                            ) : link.isActive ? (
                              <button
                                onClick={() => handleSetPrimary(link.id)}
                                className="text-[10px] text-gray-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
                                title="Make this the default primary download link and QR destination"
                              >
                                <Star className="w-2.5 h-2.5" />
                                Set as Primary
                              </button>
                            ) : null}
                          </div>

                          {/* Action Switch & Controls */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {/* Active / Inactive Toggle Switch */}
                            <button
                              onClick={() => handleToggleActive(link.id)}
                              className={`py-1 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${
                                link.isActive 
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                                  : 'bg-red-950/40 text-red-300 border-red-800/40 hover:bg-red-900/40'
                              }`}
                              title={link.isActive ? 'Click to inactivate / disable this link' : 'Click to activate this link'}
                            >
                              <Power className={`w-3 h-3 ${link.isActive ? 'text-emerald-400' : 'text-red-400'}`} />
                              <span>{link.isActive ? 'Active' : 'Inactive'}</span>
                            </button>

                            {/* Delete custom mirror */}
                            {link.isCustom && (
                              <button
                                onClick={() => handleRemoveCustomMirror(link.id)}
                                className="p-1 text-gray-500 hover:text-red-400 transition"
                                title="Remove custom mirror"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* URL Display or Edit Mode */}
                        {isEditing ? (
                          <div className="p-3 rounded-xl bg-[#061810] border border-emerald-400 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                              <span>Editing URL:</span>
                              <button
                                type="button"
                                onClick={() => handleResetLink(link.id)}
                                className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px]"
                                title="Reset to original default URL"
                              >
                                <RotateCcw className="w-3 h-3" /> Reset Default
                              </button>
                            </div>
                            <input
                              type="url"
                              value={editingUrl}
                              onChange={(e) => setEditingUrl(e.target.value)}
                              className="w-full bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                              placeholder="https://..."
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={handleCancelEdit}
                                className="py-1 px-2.5 rounded-lg border border-[#23493C] text-gray-300 text-xs hover:bg-white/5"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(link.id)}
                                className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save Link</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#061810] border border-[#23493C] rounded-xl p-2 sm:px-3 sm:py-2 gap-2">
                            <span 
                              className={`text-[11px] font-mono truncate select-all ${
                                link.isActive ? 'text-gray-200' : 'text-gray-500 line-through'
                              }`}
                              title={link.url}
                            >
                              {link.url}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                              {/* Edit URL button */}
                              <button
                                onClick={() => handleStartEdit(link)}
                                className="py-1 px-2 rounded-lg bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] text-xs flex items-center gap-1 transition"
                                title="Edit this link URL"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span className="hidden sm:inline text-[11px]">Edit</span>
                              </button>

                              {/* Copy button */}
                              <button
                                onClick={() => handleCopy(link.url, link.id)}
                                className="py-1 px-2 rounded-lg bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] text-xs flex items-center gap-1 transition font-mono"
                                title="Copy download link"
                              >
                                {copiedUrl === link.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span className="text-[11px]">{copiedUrl === link.id ? 'Copied' : 'Copy'}</span>
                              </button>

                              {/* Ping / Test button */}
                              <button
                                onClick={() => handleTestLink(link.id)}
                                disabled={isTesting}
                                className="py-1 px-2 rounded-lg bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] text-xs flex items-center gap-1 transition"
                                title="Test HTTP reachability and measure ping latency"
                              >
                                <Activity className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline text-[11px]">Test</span>
                              </button>

                              {/* Direct test download link */}
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-emerald-300 transition"
                                title="Open URL in new tab / test direct download"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Description & Health Telemetry */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#23493C]/40 gap-1.5">
                          <p className="text-[11px] text-gray-400">
                            {link.description}
                          </p>

                          <div className="flex items-center gap-2 shrink-0">
                            {testResult ? (
                              <span className={`font-mono text-[10px] flex items-center gap-1 ${
                                testResult.isReachable ? 'text-emerald-300' : 'text-red-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${testResult.isReachable ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                {testResult.statusText} ({testResult.latencyMs}ms)
                              </span>
                            ) : link.latencyMs ? (
                              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Latency: {link.latencyMs}ms
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-mono">
                                Ready for distribution
                              </span>
                            )}

                            {!link.isActive && (
                              <span className="text-[10px] text-amber-400 font-semibold">
                                &bull; Inactive in App UI
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Reference Fallbacks */}
                <div className="p-3.5 rounded-xl bg-[#081C13]/60 border border-[#23493C] space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Fallback Build Archive &amp; Local Bundle
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Build #{APK_CONFIG.buildNumber} ({APK_CONFIG.version})</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Local Server Bundled Fallback:</span>
                    <span className="font-mono text-emerald-300 select-all">{APK_CONFIG.directDownloadUrl}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD & PUBLISH NEW RELEASE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="bg-[#081C13] border border-[#23493C] rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white font-serif">
                    Upload New APK Release to Supabase Storage
                  </h4>
                  <p className="text-xs text-gray-400">
                    This automatically stores the versioned binary in <code className="text-emerald-300">apks/releases/</code> and updates the <code className="text-emerald-300">ayurindex-latest.apk</code> pointer.
                  </p>
                </div>

                {/* Version Tag Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Release Version Tag:
                  </label>
                  <input
                    type="text"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    placeholder="v1.2.0"
                    className="w-full max-w-xs py-2 px-3 bg-[#0D281C] border border-[#23493C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* File Dropzone */}
                <div className="border-2 border-dashed border-[#23493C] hover:border-emerald-500/60 rounded-2xl p-6 text-center transition bg-[#061810]/60">
                  <input
                    type="file"
                    id="apk-file-input"
                    accept=".apk,application/vnd.android.package-archive"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="apk-file-input" className="cursor-pointer space-y-2 block">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {uploadFile ? uploadFile.name : 'Click to select Ayur Index APK file'}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {uploadFile ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to upload` : 'Supports standard compiled .apk binaries up to 100 MB'}
                    </p>
                  </label>
                </div>

                {/* SHA-256 Checksum Display */}
                {calculatedSha256 && (
                  <div className="p-3 bg-[#061810] border border-[#23493C] rounded-xl text-xs space-y-1">
                    <span className="text-gray-400 uppercase text-[10px] font-mono block">Calculated SHA-256 Checksum:</span>
                    <span className="font-mono text-emerald-300 select-all break-all text-[11px] block">
                      {calculatedSha256}
                    </span>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Uploading to Supabase Storage CDN...</span>
                      <span className="font-mono">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-[#061810] rounded-full h-2 overflow-hidden border border-[#23493C]">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Result Notification */}
                {uploadResult && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    uploadResult.success 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-500/20 border-red-500/40 text-red-200'
                  }`}>
                    {uploadResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    <span>{uploadResult.message}</span>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handlePerformUpload}
                    disabled={!uploadFile || isUploading}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition"
                  >
                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{isUploading ? 'Publishing to Cloud...' : 'Publish Release to Supabase Storage'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERSION ARCHIVE & CHANGELOG */}
          {activeTab === 'archive' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
                Historical Release Archive (Supabase Storage CDN)
              </h4>

              <div className="space-y-2.5">
                {APK_CONFIG.archiveReleases.map(rel => (
                  <div 
                    key={rel.version}
                    className="p-4 rounded-2xl bg-[#081C13] border border-[#23493C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-mono">{rel.version}</span>
                        {rel.isLatest && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-semibold">
                            Current Latest
                          </span>
                        )}
                        <span className="text-xs text-gray-400">&bull; {rel.releaseDate}</span>
                        <span className="text-xs text-gray-400">&bull; {rel.fileSize}</span>
                      </div>
                      <div className="space-y-0.5 pt-1">
                        {rel.highlights.map((h, i) => (
                          <div key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <a
                      href={rel.cloudStorageUrl}
                      download
                      className="py-2 px-3.5 rounded-xl bg-[#0D281C] hover:bg-[#1A3D2E] text-emerald-300 border border-[#23493C] text-xs font-medium flex items-center gap-1.5 transition shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {rel.version}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BUCKET SETUP SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Supabase Storage Bucket SQL Definition
                  </h4>
                  <p className="text-xs text-gray-400">
                    Run this script in your Supabase Dashboard SQL Editor to guarantee the <code className="text-emerald-300 font-mono">{APK_CONFIG.supabaseStorageBucket}</code> public storage bucket and policies are active.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copied' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#061810] border border-[#23493C] text-[11px] font-mono text-emerald-300/90 overflow-x-auto whitespace-pre leading-relaxed select-all">
                {ApkStorageService.getStorageSetupSql()}
              </pre>

              <div className="p-3.5 rounded-xl bg-[#081C13] border border-emerald-500/30 flex items-center justify-between text-xs text-gray-300">
                <span>Direct link to your Supabase Project SQL Editor:</span>
                <a
                  href="https://supabase.com/dashboard/project/ksnsfilauqzxsegpjpdt/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>Open Supabase SQL Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 bg-[#081C13]/90 border-t border-[#23493C]/80 flex items-center justify-between text-xs text-gray-400">
          <span>Ayur Index Android Distribution &bull; Powered by Live Supabase Storage CDN</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-[#0D281C] hover:bg-[#1A3D2E] text-white border border-[#23493C] rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
