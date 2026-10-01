import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { User } from '../../types';
import { SupabaseService } from '../../services/supabase';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | { name?: string; email?: string; id?: string | number } | null;
  onPasswordChanged?: (userEmail: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onPasswordChanged,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetEmail = targetUser?.email || 'admin@ayurguide.internal';
  const targetName = targetUser?.name || 'Administrator';
  const targetId = targetUser?.id || 'admin_session';

  // Generate strong random password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = 'Ayur-';
    for (let i = 0; i < 8; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setErrorMessage(null);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-gray-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 2, text: 'Good', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await SupabaseService.changeUserPassword(targetId, targetEmail, newPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        if (onPasswordChanged) {
          onPasswordChanged(targetEmail);
        }
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setNewPassword('');
          setConfirmPassword('');
        }, 1600);
      } else {
        setErrorMessage(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error changing password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23493C] flex items-center justify-between bg-[#0D281C]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              <KeyRound className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-gray-100">
                Change Password
              </h3>
              <p className="text-[11px] text-emerald-400/90 font-mono">
                {targetName} &bull; {targetEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {successMessage ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-serif font-bold text-lg text-emerald-300">Password Changed</h4>
            <p className="text-xs text-gray-300 max-w-xs mx-auto">
              {successMessage}
            </p>
            <span className="text-[10px] text-gray-400 font-mono block">
              Audited in public.audit_logs &bull; Ready for authentication
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Direct Admin Bypass Banner (No current password required) */}
            <div className="bg-emerald-950/50 border border-emerald-800/60 rounded-xl p-3 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-200/90 leading-relaxed">
                <span className="font-bold text-emerald-300 block mb-0.5">Admin Privilege: No Current Password Required</span>
                You can directly establish a new password for this account. Current password verification is bypassed.
              </div>
            </div>

            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-800/70 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* New Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-200">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Strong</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min. 6 chars)"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 pr-10 font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-gray-800'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-gray-800'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-gray-800'}`} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{strength.text}</span>
                </div>
              )}
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-200 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className={`w-full bg-[#0D281C] border rounded-xl px-3.5 py-2.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none font-mono ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-rose-600 focus:border-rose-500'
                    : 'border-[#23493C] focus:border-emerald-500'
                }`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-3 border-t border-[#23493C] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-[#23493C] text-gray-300 hover:text-white hover:bg-emerald-950 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
