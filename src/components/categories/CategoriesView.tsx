import React, { useState } from 'react';
import { Layers, Plus, Edit3, Check, X } from 'lucide-react';
import { Category, Product } from '../../types';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSaveCategory: (category: Partial<Category> & { name: string; code: string }) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSaveCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Name and code are required.');
      return;
    }
    onSaveCategory({
      id: editingCategory?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      status: 'Active'
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D281C] p-6 rounded-2xl border border-[#23493C] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Ayurvedic Formulation Categories</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Classical pharmacopoeial dosage forms: Fermented Arishtams, Powdered Choornams, Medicated Lipids (Ghruthams & Thailams), and Decoctions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-semibold hover:from-emerald-500 hover:to-emerald-600 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter(p => p.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-[#0D281C] border border-[#23493C] rounded-xl p-4 flex flex-col justify-between hover:border-emerald-600/70 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#081C13] text-emerald-400 border border-[#23493C]">
                      {cat.code}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-gray-100">{cat.name}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {productCount} medicines
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {cat.description || 'Classical Ayurvedic formulation category.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#23493C]/60 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Order: #{cat.sortOrder || 1}</span>
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-[#0D281C] border-b border-[#23493C] flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-gray-100">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arishtam, Choornams"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Category Code (3-4 Letters) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ARI, CHO, THI"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Classical formulation description, vehicle base, and typical clinical administration..."
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#23493C] text-xs text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
