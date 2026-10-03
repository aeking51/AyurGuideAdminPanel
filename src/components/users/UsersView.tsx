import React, { useState } from 'react';
import { Users, Shield, UserCheck, CheckCircle, Ban, Plus, Trash2, X, UserPlus, AlertCircle, RefreshCw, KeyRound } from 'lucide-react';
import { User } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface UsersViewProps {
  users: User[];
  onUpdateRole: (userId: string | number, newRole: 'ADMIN' | 'PRACTITIONER' | 'PATIENT') => void;
  onToggleStatus: (userId: string | number) => void;
  onAddUser?: (userData: { name: string; email: string; role: 'ADMIN' | 'PRACTITIONER' | 'PATIENT'; roleTitle?: string; password?: string }) => Promise<void> | void;
  onDeleteUser?: (userId: string | number) => void;
  onReload?: () => void;
  isReloading?: boolean;
  onChangePassword?: (user: User) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  onUpdateRole,
  onToggleStatus,
  onAddUser,
  onDeleteUser,
  onReload,
  isReloading = false,
  onChangePassword,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PRACTITIONER' | 'PATIENT'>('PRACTITIONER');
  const [roleTitle, setRoleTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('Ayur#2026!');
    setRole('PRACTITIONER');
    setRoleTitle('Ayurvedic Physician (BAMS)');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert('Name and email are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (onAddUser) {
        await onAddUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
          roleTitle: roleTitle.trim() || (role === 'ADMIN' ? 'Clinical Administrator' : role === 'PRACTITIONER' ? 'Ayurvedic Physician' : 'Registered Patient')
        });
      }
      setIsModalOpen(false);
      setToastMessage(`New user "${name.trim()}" successfully created!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save new user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Clinical Directory & Practitioner Access</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Central user database synchronized with Supabase. Authorize licensed Ayurvedic clinicians, manage access levels, and assign clinical roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReload && (
            <button
              onClick={onReload}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 hover:text-white hover:bg-emerald-950 transition text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Reload user profiles live from Supabase public.profiles"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Users'}</span>
            </button>
          )}

          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 font-mono">
            {users.length} Active Records
          </span>
          {onChangePassword && users.length > 0 && (
            <button
              onClick={() => onChangePassword(users[0])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#081C13] border border-emerald-800/80 hover:bg-emerald-950 text-emerald-300 hover:text-white transition text-xs font-semibold cursor-pointer shadow-xs"
              title="Open change password modal without asking for current password"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Password</span>
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Users Table or Clean Empty State */}
      {users.length === 0 ? (
        <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center">
          <UserPlus className="w-12 h-12 text-emerald-400/70 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-gray-200">No Users in Central Database</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto mb-5">
            Your user directory is currently clean. Register Ayurvedic practitioners, medical administrators, or clinical staff.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New User</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
              <tr>
                <th className="py-3 px-4">User & Practitioner</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">System Role</th>
                <th className="py-3 px-3">Password (DB)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
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

                    {/* Password in Database */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        {user.password ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md" title="Password stored in public.profiles.password">
                            <KeyRound className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>••••••••</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 italic">Not set</span>
                        )}
                        {onChangePassword && (
                          <button
                            type="button"
                            onClick={() => onChangePassword(user)}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-semibold ml-1 cursor-pointer"
                            title="Directly change password without asking for old password"
                          >
                            Change
                          </button>
                        )}
                      </div>
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

                    {/* Role Elevation Dropdown & Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => onUpdateRole(user.id, e.target.value as any)}
                          className="bg-[#081C13] border border-[#23493C] text-xs text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="ADMIN">Elevate: ADMIN</option>
                          <option value="PRACTITIONER">Set: PRACTITIONER</option>
                          <option value="PATIENT">Demote: PATIENT</option>
                        </select>
                        {onChangePassword && (
                          <button
                            type="button"
                            onClick={() => onChangePassword(user)}
                            className="p-1.5 rounded-lg bg-[#081C13] border border-emerald-800/80 text-emerald-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
                            title={`Change password for ${user.email} (No current password required)`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteUser && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/60 transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#23493C] mb-4">
              <h3 className="text-base font-serif font-bold text-gray-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>Register New User</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Anand Sharma, BAMS"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="physician@ayurguide.org"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">System Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PRACTITIONER">PRACTITIONER (Physician / Vaidya)</option>
                  <option value="ADMIN">ADMIN (Full Clinical Director)</option>
                  <option value="PATIENT">PATIENT (Clinical Client)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Chief Dravyaguna Specialist"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Account Password (Stored in Database)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set initial password (e.g. Ayur#2026!)"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Stored directly in <code className="text-emerald-300 font-mono">public.profiles.password</code>. Can be updated anytime without current password.
                </span>
              </div>

              <div className="pt-3 border-t border-[#23493C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#23493C] text-gray-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating User...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <DeleteConfirmModal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => {
            if (onDeleteUser) {
              onDeleteUser(deletingUser.id);
            }
          }}
          title="Delete Clinical Personnel"
          itemType="User"
          itemName={deletingUser.name}
          itemSubtitle={`Email: ${deletingUser.email} (${deletingUser.role})`}
          warningMessage="This clinical personnel profile will be permanently deleted from public.profiles in Supabase. They will lose access to the administration portal."
        />
      )}

    </div>
  );
};
