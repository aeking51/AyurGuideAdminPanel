import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  Activity, 
  User as UserIcon, 
  Globe, 
  Tag, 
  Database,
  Layers,
  Sparkles,
  UserX,
  X,
  RefreshCw
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditViewProps {
  logs: AuditLog[];
  onReload?: () => void;
  isReloading?: boolean;
}

export const AuditView: React.FC<AuditViewProps> = ({ 
  logs,
  onReload,
  isReloading = false
}) => {
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterEntity, setFilterEntity] = useState<string>('ALL');
  const [filterUser, setFilterUser] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Extract unique users/actors
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      const email = l.adminEmail || l.userEmail || 'Guest user';
      set.add(email);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Extract unique actions
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      const act = l.action || l.actionType || 'UNKNOWN';
      set.add(act);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Extract unique entities
  const uniqueEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.targetEntity) set.add(l.targetEntity);
    });
    return Array.from(set).sort();
  }, [logs]);

  // Filter logs
  const filtered = useMemo(() => {
    return logs.filter(log => {
      const logAction = log.action || log.actionType || '';
      const logUser = log.adminEmail || log.userEmail || 'Guest user';
      const logEntity = log.targetEntity || '';
      const logDetails = log.details || '';
      const logTargetId = String(log.targetId || log.entityId || '');
      const logIp = log.ipAddress || '';

      if (filterAction !== 'ALL' && logAction !== filterAction) return false;
      if (filterEntity !== 'ALL' && logEntity !== filterEntity) return false;
      if (filterUser !== 'ALL' && logUser !== filterUser) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = 
          logDetails.toLowerCase().includes(q) ||
          logUser.toLowerCase().includes(q) ||
          logAction.toLowerCase().includes(q) ||
          logEntity.toLowerCase().includes(q) ||
          logTargetId.toLowerCase().includes(q) ||
          logIp.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [logs, filterAction, filterEntity, filterUser, search]);

  const exportAuditCsv = () => {
    const headers = ['ID', 'Timestamp (UTC)', 'Admin / User Email', 'Action', 'Target Entity', 'Target ID', 'IP Address', 'Details'];
    const rows = filtered.map(l => [
      `"${l.id}"`,
      `"${l.createdAt || l.timestamp}"`,
      `"${l.adminEmail || l.userEmail || 'Guest user'}"`,
      `"${l.action || l.actionType}"`,
      `"${l.targetEntity || ''}"`,
      `"${l.targetId || l.entityId || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ayurguide_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderEntityBadge = (entity?: string) => {
    switch (entity?.toLowerCase()) {
      case 'product':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <Sparkles className="w-2.5 h-2.5" />
            Product
          </span>
        );
      case 'category':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
            <Layers className="w-2.5 h-2.5" />
            Category
          </span>
        );
      case 'botanicalingredient':
      case 'ingredient':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-lime-950 text-lime-300 border border-lime-800">
            <Sparkles className="w-2.5 h-2.5" />
            Botanical
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
            <UserIcon className="w-2.5 h-2.5" />
            User
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
            <Database className="w-2.5 h-2.5" />
            System
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-900 text-gray-400 border border-gray-700">
            <Tag className="w-2.5 h-2.5" />
            {entity || 'General'}
          </span>
        );
    }
  };

  const renderActionBadge = (action: string) => {
    const act = action.toUpperCase();
    let colorClasses = 'bg-emerald-950 text-emerald-300 border-emerald-800';

    if (act.includes('DELETE')) {
      colorClasses = 'bg-rose-950 text-rose-300 border-rose-800';
    } else if (act.includes('UPDATE') || act.includes('ROLE')) {
      colorClasses = 'bg-amber-950 text-amber-300 border-amber-800';
    } else if (act.includes('CREATE') || act.includes('INSERT')) {
      colorClasses = 'bg-emerald-950 text-emerald-300 border-emerald-700';
    } else if (act.includes('LOGIN')) {
      colorClasses = 'bg-blue-950 text-blue-300 border-blue-700';
    } else if (act.includes('LOGOUT')) {
      colorClasses = 'bg-gray-800 text-gray-300 border-gray-600';
    } else if (act.includes('STOCK')) {
      colorClasses = 'bg-cyan-950 text-cyan-300 border-cyan-800';
    }

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colorClasses}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Clinical Audit Trail & Log Ledger</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Live PostgreSQL audit trail synced with <code className="text-emerald-300 font-mono">public.audit_logs</code>. Every user action is recorded with identity, target entity, timestamp, and IP address. Unauthenticated actions are flagged as <span className="text-amber-400 font-semibold">"Guest user"</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onReload && (
            <button
              onClick={onReload}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 text-xs font-semibold hover:text-white hover:bg-emerald-950 transition shadow-sm cursor-pointer disabled:opacity-50"
              title="Reload audit trail live from Supabase public.audit_logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Logs'}</span>
            </button>
          )}

          <button
            onClick={exportAuditCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 text-xs font-semibold hover:text-white hover:bg-emerald-950 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D281C]/90 p-4 rounded-xl border border-[#23493C] flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-gray-400 font-medium">Filter:</span>
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          {/* User / Actor Filter */}
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Users / Actors</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>
                {user === 'Guest user' ? 'Guest user (Unauthenticated)' : user}
              </option>
            ))}
          </select>

          {/* Target Entity Filter */}
          {uniqueEntities.length > 0 && (
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Entities</option>
              {uniqueEntities.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          )}

          {(filterAction !== 'ALL' || filterUser !== 'ALL' || filterEntity !== 'ALL' || search) && (
            <button
              onClick={() => {
                setFilterAction('ALL');
                setFilterUser('ALL');
                setFilterEntity('ALL');
                setSearch('');
              }}
              className="text-[11px] text-gray-400 hover:text-emerald-300 underline ml-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, action, entity, IP or detail..."
            className="w-full bg-[#081C13] border border-[#23493C] rounded-lg pl-9 pr-7 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Activity className="w-10 h-10 text-emerald-400/60 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-gray-200">No Matching Audit Logs Found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {logs.length === 0 
                ? 'No audit entries currently in public.audit_logs.' 
                : 'Try adjusting your search criteria or action filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-3">Actor / User</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-3">Target ID</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-4 min-w-[200px]">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23493C]/50 font-mono text-xs">
                {filtered.map((log) => {
                  const email = log.adminEmail || log.userEmail || 'Guest user';
                  const isGuest = email.toLowerCase() === 'guest user' || !email.includes('@');
                  const action = log.action || log.actionType || 'ACTION';
                  const timestamp = log.createdAt || log.timestamp;

                  return (
                    <tr key={log.id} className="hover:bg-[#133829]/40 transition">
                      
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                        {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
                      </td>

                      {/* Actor / User Email */}
                      <td className="py-3 px-3">
                        {isGuest ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                            <UserX className="w-3 h-3 text-amber-400" />
                            Guest user
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 font-sans">
                            <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-[9px] font-bold text-emerald-300 shrink-0">
                              {email.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-emerald-300 font-medium truncate max-w-[150px]" title={email}>
                              {email}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderActionBadge(action)}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {renderEntityBadge(log.targetEntity)}
                      </td>

                      {/* Target ID */}
                      <td className="py-3 px-3 text-gray-200 font-semibold whitespace-nowrap">
                        {log.targetId || log.entityId || '—'}
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-3 whitespace-nowrap text-gray-400 text-[11px]">
                        {log.ipAddress ? (
                          <span className="inline-flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-500" />
                            <span>{log.ipAddress}</span>
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 font-sans text-gray-200 text-xs">
                        {log.details || '—'}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
