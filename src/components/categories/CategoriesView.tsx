import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Search, 
  X, 
  Check,
  Leaf,
  FlaskConical,
  Droplet,
  Sparkles,
  Heart,
  Wind,
  CircleDot,
  Flame,
  Pill,
  Wine,
  RefreshCw
} from 'lucide-react';
import { Category, Product } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSaveCategory: (category: Partial<Category> & { name: string; code?: string; title?: string; description?: string; icon?: string }) => void;
  onDeleteCategory?: (id: number | string) => void;
  onReload?: () => void;
  isReloading?: boolean;
}

const AVAILABLE_ICONS = [
  { key: 'leaf', label: 'Leaf / Plant', Icon: Leaf },
  { key: 'flask', label: 'Flask / Decoction', Icon: FlaskConical },
  { key: 'droplet', label: 'Droplet / Ghee', Icon: Droplet },
  { key: 'sparkles', label: 'Sparkles / Oil', Icon: Sparkles },
  { key: 'wine-glass', label: 'Fermented Wine', Icon: Wine },
  { key: 'heart', label: 'Heart / Rasayana', Icon: Heart },
  { key: 'wind', label: 'Wind / Choornam', Icon: Wind },
  { key: 'circle-dot', label: 'Pill / Gulika', Icon: CircleDot },
  { key: 'flame', label: 'Flame / Bhasma', Icon: Flame },
  { key: 'capsule', label: 'Capsule / Softgel', Icon: Pill },
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSaveCategory,
  onDeleteCategory,
  onReload,
  isReloading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('leaf');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setTitle('');
    setDescription('');
    setIcon('leaf');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setCode(cat.code || '');
    setTitle(cat.title || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'leaf');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name is required.');
      return;
    }

    onSaveCategory({
      id: editingCategory?.id,
      name: name.trim(),
      code: (code.trim() || name.slice(0, 3)).toUpperCase(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      icon: icon || 'leaf',
    });

    setIsModalOpen(false);
  };

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const getProductCountForCat = (cat: Category) => {
    return products.filter(p => 
      p.categoryId === cat.id || 
      (p.categoryName && p.categoryName.toLowerCase() === cat.name.toLowerCase())
    ).length;
  };

  const renderCategoryIcon = (iconKey?: string) => {
    switch (iconKey) {
      case 'flask': return <FlaskConical className="w-4 h-4 text-emerald-400" />;
      case 'droplet': return <Droplet className="w-4 h-4 text-amber-400" />;
      case 'sparkles': return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'wine-glass': return <Wine className="w-4 h-4 text-red-400" />;
      case 'heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'wind': return <Wind className="w-4 h-4 text-cyan-400" />;
      case 'circle-dot': return <CircleDot className="w-4 h-4 text-purple-400" />;
      case 'flame': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'capsule':
      case 'tablets': return <Pill className="w-4 h-4 text-blue-400" />;
      default: return <Leaf className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D281C] p-6 rounded-2xl border border-[#23493C] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Ayurvedic Formulation Categories</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Live taxonomy managed directly in PostgreSQL table <code className="text-emerald-300 font-mono">public.categories</code>. All medicines reflect linked categories in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onReload && (
            <button
              onClick={onReload}
              disabled={isReloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#081C13] border border-[#23493C] text-emerald-300 hover:text-white hover:bg-emerald-950 transition text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Reload categories live from Supabase public.categories"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? 'Reloading...' : 'Reload Categories'}</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-semibold hover:from-emerald-500 hover:to-emerald-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Total Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#081C13] p-4 rounded-xl border border-[#23493C]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories by name, code, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0D281C] border border-[#23493C] rounded-lg text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Showing <span className="text-emerald-400 font-bold">{filteredCategories.length}</span> of {categories.length} database categories
        </div>
      </div>

      {/* Categories Grid or Clean Empty State */}
      {categories.length === 0 ? (
        <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-12 text-center">
          <AlertCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-serif font-bold text-gray-200">No Categories Stored in Database</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto mb-5 leading-relaxed">
            The category registry is clean with zero placeholder records. Create your first classical Ayurvedic dosage form to populate <code className="text-emerald-300 font-mono">public.categories</code>.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-[#0D281C]/70 rounded-2xl border border-[#23493C] p-8 text-center text-gray-400">
          <p className="text-sm">No categories match your search query "{searchQuery}".</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-medium underline"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const productCount = getProductCountForCat(cat);

            return (
              <div
                key={cat.id}
                className="bg-[#0D281C] border border-[#23493C] rounded-xl p-5 flex flex-col justify-between hover:border-emerald-600/70 transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#081C13] border border-[#23493C]">
                        {renderCategoryIcon(cat.icon)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-gray-100 group-hover:text-emerald-300 transition">
                          {cat.name}
                        </h3>
                        {cat.title && (
                          <div className="text-[11px] text-emerald-400/90 font-medium">
                            {cat.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#081C13] text-emerald-400 border border-[#23493C] uppercase shrink-0">
                      {cat.code || 'CAT'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
                    {cat.description || 'Classical Ayurvedic formulation category.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#23493C]/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500">ID #{cat.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {productCount} medicines
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[#081C13] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/80 border border-[#23493C] transition"
                      title="Edit Category Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {onDeleteCategory && (
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 rounded-lg bg-[#081C13] text-red-400 hover:text-red-300 hover:bg-red-950/80 border border-[#23493C] transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#23493C] flex items-center justify-between bg-[#0D281C]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-serif font-bold text-gray-100">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Formulation Category'}
                  </h3>
                  <p className="text-[11px] text-emerald-400/80">Configure public.categories schema parameters</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Category Name * <span className="text-[10px] text-gray-400 font-normal">(Unique in public.categories)</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arishtams & Asavams"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Taxonomic Code <span className="text-[10px] text-gray-400 font-normal">(e.g. ARISHTAM)</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ARISHTAM"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    Category Title / Subtitle
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fermented Formulations"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Dosage Form Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const isSelected = icon === item.key;
                    const ItemIcon = item.Icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setIcon(item.key)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-[#0D281C] border-[#23493C] text-gray-400 hover:text-gray-200'
                        }`}
                        title={item.label}
                      >
                        <ItemIcon className="w-4 h-4" />
                        <span className="truncate w-full text-center">{item.key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Pharmacopoeial Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Clinical properties, bioavailability, and manufacturing characteristics of this dosage form..."
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#23493C] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#23493C] text-gray-300 hover:text-white hover:bg-emerald-950 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md inline-flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <DeleteConfirmModal
          isOpen={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onConfirm={() => {
            if (onDeleteCategory) {
              onDeleteCategory(deletingCategory.id);
            }
          }}
          title="Delete Category"
          itemType="Category"
          itemName={deletingCategory.name}
          itemSubtitle={`Code: ${deletingCategory.code || 'CAT'} • ID #${deletingCategory.id}`}
          warningMessage={
            getProductCountForCat(deletingCategory) > 0
              ? `Warning: ${getProductCountForCat(deletingCategory)} medicines are currently assigned to this category. Deleting it will unlink their category in Supabase public.products.`
              : 'This category will be permanently removed from public.categories in Supabase.'
          }
        />
      )}

    </div>
  );
};
