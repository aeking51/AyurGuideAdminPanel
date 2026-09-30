import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemSubtitle?: string;
  itemType: 'Medicine' | 'Category' | 'User' | 'Botanical Ingredient';
  warningMessage?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemSubtitle,
  itemType,
  warningMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#081C13] border border-red-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23493C] flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800/80">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="font-serif font-bold text-base text-gray-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            Are you sure you want to permanently delete this {itemType.toLowerCase()}?
          </p>

          <div className="p-3.5 rounded-xl bg-[#0D281C] border border-[#23493C] space-y-1">
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">{itemType}</div>
            <div className="font-serif font-bold text-base text-gray-100">{itemName}</div>
            {itemSubtitle && (
              <div className="text-xs font-mono text-gray-400">{itemSubtitle}</div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-300 leading-relaxed">
            {warningMessage || 'This operation will immediately delete the record from the Supabase database. This action cannot be reversed.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0A2218] border-t border-[#23493C] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#23493C] text-gray-300 hover:text-white hover:bg-emerald-950 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Permanently Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
