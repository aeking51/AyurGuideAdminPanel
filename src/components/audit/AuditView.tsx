import React, { useState } from 'react';
import { History, Search, Download, Filter, ShieldCheck, Activity } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditViewProps {
  logs: AuditLog[];
}

export const AuditView: React.FC<AuditViewProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = logs.filter(log => {
    if (filterType !== 'ALL' && log.actionType !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!log.details.toLowerCase().includes(q) && !log.userEmail.toLowerCase().includes(q) && !String(log.entityId).toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'User', 'Action Type', 'Entity ID', 'Details'];
    const rows = filtered.map(l => [
      `"${l.timestamp}"`,
      `"${l.userEmail}"`,
      `"${l.actionType}"`,
      `"${l.entityId}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ayurguide_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Cryptographically sealed and timestamped action trail tracking all stock changes, practitioner authorizations, and clinical database updates.
          </p>
        </div>

        <button
          onClick={exportAuditCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-gray-200 text-xs font-semibold hover:text-white hover:bg-emerald-950 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D281C]/80 p-4 rounded-xl border border-[#23493C]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Action Types ({logs.length})</option>
            <option value="STOCK_UPDATE">Stock Adjustments</option>
            <option value="MEDICINE_CREATE">Medicine Creations</option>
            <option value="MEDICINE_UPDATE">Medicine Updates</option>
            <option value="MEDICINE_DELETE">Medicine Deletions</option>
            <option value="ROLE_CHANGE">Role Elevations</option>
            <option value="DATABASE_SYNC">Database Syncs</option>
          </select>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by admin email, entity or message..."
          className="w-full sm:w-80 bg-[#081C13] border border-[#23493C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Log Entries Table */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-3">Actor / Email</th>
              <th className="py-3 px-3">Action Type</th>
              <th className="py-3 px-3">Target Entity</th>
              <th className="py-3 px-4">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23493C]/50 font-mono text-xs">
            {filtered.map((log) => {
              const isStock = log.actionType === 'STOCK_UPDATE';
              const isRole = log.actionType === 'ROLE_CHANGE';
              const isSync = log.actionType === 'DATABASE_SYNC';

              return (
                <tr key={log.id} className="hover:bg-[#133829]/40 transition">
                  
                  {/* Timestamp */}
                  <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-3 text-emerald-400 font-semibold">
                    {log.userEmail}
                  </td>

                  {/* Action Badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      isStock
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : isRole
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : isSync
                        ? 'bg-sky-950 text-sky-300 border border-sky-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {log.actionType}
                    </span>
                  </td>

                  {/* Entity ID */}
                  <td className="py-3 px-3 text-gray-300 font-bold">
                    {log.entityId}
                  </td>

                  {/* Details */}
                  <td className="py-3 px-4 font-sans text-gray-300">
                    {log.details}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
