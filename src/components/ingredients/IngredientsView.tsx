import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Search, 
  Flower2, 
  BookOpen, 
  Link2, 
  ExternalLink,
  RefreshCw 
} from 'lucide-react';
import { BotanicalIngredient } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface IngredientsViewProps {
  ingredients: BotanicalIngredient[];
  onSaveIngredient: (item: Partial<BotanicalIngredient> & { name: string }) => void;
  onDeleteIngredient: (id: number | string) => void;
  onReload?: () => void;
  isReloading?: boolean;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
  onReload,
  isReloading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BotanicalIngredient | null>(null);
  const [deletingItem, setDeletingItem] = useState<BotanicalIngredient | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [sanskritName, setSanskritName] = useState('');
  const [partUsed, setPartUsed] = useState('');
  const [therapeuticAction, setTherapeuticAction] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  const filtered = ingredients.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.botanicalName || '').toLowerCase().includes(q) ||
      (item.sanskritName || '').toLowerCase().includes(q) ||
      (item.therapeuticAction || '').toLowerCase().includes(q) ||
      (item.partUsed || '').toLowerCase().includes(q) ||
      (item.referenceLink || '').toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setBotanicalName('');
    setSanskritName('');
    setPartUsed('Root');
    setTherapeuticAction('Rasayana, Balya');
    setReferenceLink('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BotanicalIngredient) => {
    setEditingItem(item);
    setName(item.name);
    setBotanicalName(item.botanicalName || '');
    setSanskritName(item.sanskritName || '');
    setPartUsed(item.partUsed || '');
    setTherapeuticAction(item.therapeuticAction || '');
    setReferenceLink(item.referenceLink || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Ingredient name is required.');
      return;
    }

    onSaveIngredient({
      id: editingItem?.id,
      name: name.trim(),
      botanicalName: botanicalName.trim(),
      sanskritName: sanskritName.trim(),
      partUsed: partUsed.trim(),
      therapeuticAction: therapeuticAction.trim(),
      referenceLink: referenceLink.trim()
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Medicinal Herbs & Botanical Directory</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Central repository of standardized Ayurvedic herbs, medicinal plants, and ingredients synchronized with Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReload && (
            <button
              onClick={onReload}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 hover:text-white hover:bg-emerald-950 transition text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Reload botanicals live from Supabase public.ingredients"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Herbs'}</span>
            </button>
          )}

          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 font-mono">
            {ingredients.length} Registered Herbs
          </span>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Herb / Botanical</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by common name, Latin binomial, Sanskrit, or URL..."
            className="w-full bg-[#081C13] border border-[#23493C] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">
          Showing {filtered.length} of {ingredients.length} botanicals
        </span>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center">
          <Flower2 className="w-12 h-12 text-emerald-400/70 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-gray-200">
            {searchQuery ? 'No Matching Herbs Found' : 'No Medicinal Herbs Cataloged Yet'}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto mb-5">
            {searchQuery ? 'Try clearing your search query.' : 'Populate your repository with authentic Ayurvedic herbs, parts used, therapeutic actions, and research reference URLs.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Herb</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
              <tr>
                <th className="py-3 px-4">Herb Common Name</th>
                <th className="py-3 px-3">Botanical Binomial</th>
                <th className="py-3 px-3">Sanskrit Name</th>
                <th className="py-3 px-3">Part Used</th>
                <th className="py-3 px-3">Therapeutic Action</th>
                <th className="py-3 px-3">Reference Link</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23493C]/50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#133829]/40 transition group">
                  
                  {/* Herb Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-gray-100 text-sm">{item.name}</span>
                    </div>
                  </td>

                  {/* Botanical Binomial */}
                  <td className="py-3 px-3 font-serif italic text-emerald-300 text-xs">
                    {item.botanicalName || '—'}
                  </td>

                  {/* Sanskrit Name */}
                  <td className="py-3 px-3 font-serif text-amber-200 text-xs">
                    {item.sanskritName || '—'}
                  </td>

                  {/* Part Used */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#081C13] border border-[#23493C] text-[11px] text-gray-300">
                      {item.partUsed || 'Whole Plant'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-xs text-gray-300 max-w-xs truncate" title={item.therapeuticAction}>
                    {item.therapeuticAction || '—'}
                  </td>

                  {/* Reference Link */}
                  <td className="py-3 px-3">
                    {item.referenceLink ? (
                      <a
                        href={item.referenceLink.startsWith('http') ? item.referenceLink : `https://${item.referenceLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#081C13] border border-[#23493C] text-[11px] text-emerald-400 hover:text-emerald-300 hover:border-emerald-600 transition max-w-[160px] truncate"
                        title={item.referenceLink}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0 text-emerald-400" />
                        <span className="truncate">
                          {item.referenceLink.replace(/^https?:\/\/(www\.)?/, '')}
                        </span>
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 rounded text-emerald-400 hover:text-emerald-300 transition"
                        title="Edit Ingredient"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-1 rounded text-red-400 hover:text-red-300 transition"
                        title="Delete Ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#23493C] mb-4">
              <h3 className="text-base font-serif font-bold text-gray-100 flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-emerald-400" />
                <span className="tracking-wide text-sm font-semibold text-emerald-100">
                  {editingItem ? `Edit Medicinal Herb` : 'Register Medicinal Herb'}
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Common / Formulation Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ashwagandha, Guduchi, Haritaki"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Botanical Binomial (Latin)</label>
                <input
                  type="text"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  placeholder="e.g. Withania somnifera, Tinospora cordifolia"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 italic focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Sanskrit Name (Devanagari / IAST)</label>
                <input
                  type="text"
                  value={sanskritName}
                  onChange={(e) => setSanskritName(e.target.value)}
                  placeholder="e.g. अश्वगन्धा (Aśvagandhā)"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Part Used</label>
                <input
                  type="text"
                  value={partUsed}
                  onChange={(e) => setPartUsed(e.target.value)}
                  placeholder="e.g. Root, Fruit rind, Leaf, Bark, Whole plant"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">Therapeutic Action (Karma)</label>
                <textarea
                  rows={2}
                  value={therapeuticAction}
                  onChange={(e) => setTherapeuticAction(e.target.value)}
                  placeholder="e.g. Rasayana, Balya, Vata-hara, Medhya, Deepana"
                  className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Reference Link Field */}
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reference Link</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">URL (monograph, research, pharmacopoeia)</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={referenceLink}
                    onChange={(e) => setReferenceLink(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/Withania_somnifera"
                    className="w-full bg-[#081C13] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                  />
                </div>
                {referenceLink.trim() && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <a
                      href={referenceLink.startsWith('http') ? referenceLink : `https://${referenceLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate"
                    >
                      Preview link ↗
                    </a>
                  </div>
                )}
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
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={() => {
            onDeleteIngredient(deletingItem.id);
          }}
          title="Delete Botanical Ingredient"
          itemType="Botanical Ingredient"
          itemName={deletingItem.name}
          itemSubtitle={deletingItem.botanicalName ? `Binomial: ${deletingItem.botanicalName}` : undefined}
          warningMessage="This botanical herb will be permanently deleted from public.ingredients in Supabase."
        />
      )}

    </div>
  );
};
