import React from 'react';
import { Users, Shield, UserCheck, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { User } from '../../types';

interface UsersViewProps {
  users: User[];
  onUpdateRole: (userId: string | number, newRole: 'ADMIN' | 'PRACTITIONER' | 'PATIENT') => void;
  onToggleStatus: (userId: string | number) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onUpdateRole,
  onToggleStatus,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Clinical Directory & Practitioner Access</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Manage authenticated clinical personnel, elevate physician consultation credentials, and review user role allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 font-mono">
            {users.length} Registered Accounts
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
            <tr>
              <th className="py-3 px-4">User & Practitioner</th>
              <th className="py-3 px-3">Email Address</th>
              <th className="py-3 px-3">System Role</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Registered Since</th>
              <th className="py-3 px-4 text-right">Role Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23493C]/50">
            {users.map((user) => {
              const isAdmin = user.role === 'ADMIN';
              const isPractitioner = user.role === 'PRACTITIONER';

              return (
                <tr key={user.id} className="hover:bg-[#133829]/40 transition">
                  
                  {/* Name & Initials */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono border ${
                        isAdmin
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : isPractitioner
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          : 'bg-gray-800 text-gray-300 border-gray-700'
                      }`}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-100 text-sm">{user.name}</div>
                        <span className="text-[11px] text-gray-400">{user.roleTitle || user.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-3 font-mono text-xs text-gray-300">
                    {user.email}
                  </td>

                  {/* Role Badge */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isAdmin
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-700/60'
                        : isPractitioner
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/60'
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}>
                      {isAdmin && <Shield className="w-3 h-3" />}
                      {isPractitioner && <UserCheck className="w-3 h-3" />}
                      <span>{user.role}</span>
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                        user.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-red-950 hover:text-red-300 hover:border-red-800'
                          : 'bg-red-950 text-red-300 border border-red-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
                      }`}
                      title="Click to toggle account status"
                    >
                      {user.status === 'Active' ? <CheckCircle className="w-2.5 h-2.5" /> : <Ban className="w-2.5 h-2.5" />}
                      <span>{user.status || 'Active'}</span>
                    </button>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-xs text-gray-400 font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* Role Elevation Dropdown */}
                  <td className="py-3 px-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => onUpdateRole(user.id, e.target.value as any)}
                      className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ADMIN">Elevate: ADMIN</option>
                      <option value="PRACTITIONER">Set: PRACTITIONER</option>
                      <option value="PATIENT">Demote: PATIENT</option>
                    </select>
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
