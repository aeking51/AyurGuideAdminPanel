import React, { useState, useMemo } from 'react';
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
  RefreshCw,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BotanicalIngredient, Product } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { buildUnifiedBotanicalDirectory } from '../../utils/dravyagunaDirectory';

interface IngredientsViewProps {
  ingredients: BotanicalIngredient[];
  products?: Product[];
  onSaveIngredient: (item: Partial<BotanicalIngredient> & { name: string }) => void;
  onDeleteIngredient: (id: number | string) => void;
  onReload?: () => void;
  isReloading?: boolean;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  ingredients,
  products = [],
  onSaveIngredient,
  onDeleteIngredient,
  onReload,
  isReloading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'registered' | 'derived'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BotanicalIngredient | null>(null);
  const [deletingItem, setDeletingItem] = useState<BotanicalIngredient | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [botanicalName, setBotanicalName] = useState('');
  const [sanskritName, setSanskritName] = useState('');
  const [partUsed, setPartUsed] = useState('');
  const [therapeuticAction, setTherapeuticAction] = useState('');
  const [referenceLink, setReferenceLink] = useState('');

  // 1. Build unified directory merging registered public.ingredients with all medicine formularies
  const unifiedIngredients = useMemo(() => {
    return buildUnifiedBotanicalDirectory(ingredients, products);
  }, [ingredients, products]);

  // Set of registered herb names for quick lookup
  const registeredNameSet = useMemo(() => {
    return new Set(ingredients.map(i => (i.name || '').trim().toLowerCase()));
  }, [ingredients]);

  // Total formulary ingredient references
  const totalFormularyOccurrences = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.ingredients?.length || 0), 0);
  }, [products]);

  // Filter based on filterMode and searchQuery
  const filtered = useMemo(() => {
    return unifiedIngredients.filter(item => {
      const isRegistered = registeredNameSet.has((item.name || '').trim().toLowerCase());
      if (filterMode === 'registered' && !isRegistered) return false;
      if (filterMode === 'derived' && isRegistered) return false;

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
  }, [unifiedIngredients, registeredNameSet, filterMode, searchQuery]);

  const unsyncedCount = useMemo(() => {
    return unifiedIngredients.filter(u => !registeredNameSet.has((u.name || '').trim().toLowerCase())).length;
  }, [unifiedIngredients, registeredNameSet]);

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
      id: typeof editingItem?.id === 'number' || (typeof editingItem?.id === 'string' && !editingItem.id.startsWith('derived-')) 
        ? editingItem.id 
        : undefined,
      name: name.trim(),
      botanicalName: botanicalName.trim(),
      sanskritName: sanskritName.trim(),
      partUsed: partUsed.trim(),
      therapeuticAction: therapeuticAction.trim(),
      referenceLink: referenceLink.trim()
    });

    setIsModalOpen(false);
  };

  // Sync / bulk-register all derived ingredients into public.ingredients in Supabase
  const handleSyncAllToSupabase = async () => {
    if (unsyncedCount === 0) return;
    setIsSyncingAll(true);
    setSyncSuccessMsg('');

    try {
      const itemsToSync = unifiedIngredients.filter(u => !registeredNameSet.has((u.name || '').trim().toLowerCase()));
      for (const item of itemsToSync) {
        await onSaveIngredient({
          name: item.name,
          botanicalName: item.botanicalName,
          sanskritName: item.sanskritName,
          partUsed: item.partUsed,
          therapeuticAction: item.therapeuticAction,
          referenceLink: item.referenceLink
        });
      }
      setSyncSuccessMsg(`Successfully synchronized all ${itemsToSync.length} herbs into the central database!`);
      setTimeout(() => setSyncSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to sync ingredients:', err);
    } finally {
      setIsSyncingAll(false);
    }
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
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Central repository of standardized Ayurvedic herbs, medicinal plants, and active ingredients indexed across all {products.length} medicines and synchronized with Supabase.
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-emerald-400/90">
            <span>{unifiedIngredients.length} Unique Botanicals</span>
            <span>&bull;</span>
            <span>{totalFormularyOccurrences} Formulary References</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unsyncedCount > 0 && (
            <button
              onClick={handleSyncAllToSupabase}
              disabled={isSyncingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/70 text-amber-300 text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
              title="Save all uncatalogued medicine ingredients permanently into Supabase"
            >
              <Database className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Syncing...' : `Sync ${unsyncedCount} to Database`}</span>
            </button>
          )}

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

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Herb / Botanical</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Toolbar */}
      <div className="bg-[#0D281C]/90 rounded-2xl border border-[#23493C] p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by common name, Latin binomial, Sanskrit, or therapeutic action..."
            className="w-full bg-[#081C13] border border-[#23493C] rounded-xl pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#081C13] text-gray-400 hover:text-white border border-[#23493C]'
            }`}
          >
            All Botanicals ({unifiedIngredients.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('registered')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filterMode === 'registered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#081C13] text-gray-400 hover:text-white border border-[#23493C]'
            }`}
          >
            Registered in Database ({ingredients.length})
          </button>

          {unsyncedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode('derived')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filterMode === 'derived'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[#081C13] text-amber-300 hover:text-white border border-amber-900/60'
              }`}
            >
              From Formularies ({unsyncedCount})
            </button>
          )}

          <span className="text-xs text-gray-400 font-mono pl-2 hidden lg:inline">
            Showing {filtered.length} of {unifiedIngredients.length} botanicals
          </span>
        </div>

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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#081C13]/90 text-[11px] uppercase font-semibold text-emerald-300/80 tracking-wider border-b border-[#23493C]">
                <tr>
                  <th className="py-3 px-4">Herb Common Name</th>
                  <th className="py-3 px-3">Botanical Binomial</th>
                  <th className="py-3 px-3">Sanskrit Name</th>
                  <th className="py-3 px-3">Part Used</th>
                  <th className="py-3 px-3">Therapeutic Action</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Reference Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23493C]/50">
                {filtered.map((item) => {
                  const isRegistered = registeredNameSet.has((item.name || '').trim().toLowerCase());

                  return (
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
                          {item.partUsed || 'Standardized Part'}
                        </span>
                      </td>

                      {/* Therapeutic Action */}
                      <td className="py-3 px-3 text-xs text-gray-300 max-w-xs">
                        <span className="line-clamp-2">{item.therapeuticAction || 'Classical active'}</span>
                      </td>

                      {/* Origin Status */}
                      <td className="py-3 px-3">
                        {isRegistered ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Database</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSaveIngredient(item)}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 transition cursor-pointer"
                            title="Click to save permanently to Supabase"
                          >
                            <span>+ Save to DB</span>
                          </button>
                        )}
                      </td>

                      {/* Reference Link */}
                      <td className="py-3 px-3 text-xs">
                        {item.referenceLink ? (
                          <a
                            href={item.referenceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 truncate max-w-[140px] hover:underline"
                            title={item.referenceLink}
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {item.referenceLink.replace(/^https?:\/\/(www\.)?/, '')}
                            </span>
                          </a>
                        ) : (
                          <span className="text-gray-500 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
                            title="Edit Botanical details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {isRegistered && (
                            <button
                              onClick={() => setDeletingItem(item)}
                              className="p-1 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-950/40 transition cursor-pointer"
                              title="Delete from database"
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
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-[#0D281C] to-[#0A2217] px-6 py-4 border-b border-[#23493C] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Flower2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif font-bold text-base text-gray-100">
                  {editingItem ? 'Edit Botanical Herb' : 'Register New Botanical Herb'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-950 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Herb Common Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ashwagandha, Rasna, Bala"
                  className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Botanical Latin Binomial
                </label>
                <input
                  type="text"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  placeholder="e.g. Withania somnifera, Pluchea lanceolata"
                  className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 italic focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Sanskrit Name (Devanagari / IAST)
                </label>
                <input
                  type="text"
                  value={sanskritName}
                  onChange={(e) => setSanskritName(e.target.value)}
                  placeholder="e.g. अश्वगन्धा, रास्ना, बला"
                  className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Part Used
                  </label>
                  <input
                    type="text"
                    value={partUsed}
                    onChange={(e) => setPartUsed(e.target.value)}
                    placeholder="e.g. Root, Bark, Leaf, Fruit"
                    className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Therapeutic Action
                  </label>
                  <input
                    type="text"
                    value={therapeuticAction}
                    onChange={(e) => setTherapeuticAction(e.target.value)}
                    placeholder="e.g. Rasayana, Balya, Deepana"
                    className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Pharmacopoeial / Reference URL
                </label>
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="https://en.wikipedia.org/wiki/..."
                  className="w-full bg-[#05140D] border border-[#23493C] rounded-xl px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0D281C] text-gray-400 hover:text-white border border-[#23493C] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Register Botanical'}
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
          title="Delete Botanical Herb"
          itemName={deletingItem.name}
          itemSubtitle={deletingItem.botanicalName}
          itemType="Botanical Ingredient"
          onConfirm={() => {
            onDeleteIngredient(deletingItem.id);
            setDeletingItem(null);
          }}
          onClose={() => setDeletingItem(null)}
        />
      )}

    </div>
  );
};
