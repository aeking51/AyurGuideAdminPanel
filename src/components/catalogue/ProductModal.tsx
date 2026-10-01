import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sparkles, Check, Camera, Image as ImageIcon, Star, Leaf, BookOpen } from 'lucide-react';
import { Product, Category, IngredientItem, BotanicalIngredient } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product> & { name: string }) => void;
  product?: Product | null;
  categories: Category[];
  availableIngredients?: BotanicalIngredient[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  availableIngredients = [],
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'clinical' | 'ingredients'>('general');

  // Form State
  const [name, setName] = useState('');
  const [sanskritName, setSanskritName] = useState('');
  const [code, setCode] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [classicalReference, setClassicalReference] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [primaryBenefit, setPrimaryBenefit] = useState('');
  const [doshaImpact, setDoshaImpact] = useState('');
  const [targetDoshas, setTargetDoshas] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [usage, setUsage] = useState('');
  const [indications, setIndications] = useState('');
  const [packings, setPackings] = useState<string[]>(['450 ml']);
  const [packingInput, setPackingInput] = useState('');
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Draft'>('Active');
  const [featured, setFeatured] = useState(false);
  const [batchNumber, setBatchNumber] = useState('');

  // Existing Botanicals Selection State
  const [selectedBotanicalId, setSelectedBotanicalId] = useState<string>('');

  // New Ingredient Row
  const [newIngName, setNewIngName] = useState('');
  const [newIngBotanical, setNewIngBotanical] = useState('');
  const [newIngPart, setNewIngPart] = useState('');
  const [newIngRole, setNewIngRole] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSanskritName(product.sanskritName || '');
      setCode(product.code || '');
      const matchedCat = categories.find(c => 
        (product.categoryName && c.name.toLowerCase() === product.categoryName.toLowerCase()) ||
        c.id === product.categoryId
      );
      setCategoryId(matchedCat ? matchedCat.id : (product.categoryId || categories[0]?.id || 1));
      setClassicalReference(product.classicalReference || '');
      let loadedImages: string[] = [];
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        loadedImages = product.images.filter(Boolean);
      } else if (product.imageUrl) {
        loadedImages = [product.imageUrl];
      }
      setImages(loadedImages);
      setImageUrl(loadedImages[0] || product.imageUrl || '');
      setDescription(product.description || '');
      setPrimaryBenefit(product.primaryBenefit || '');
      setDoshaImpact(product.doshaImpact || '');
      setTargetDoshas(product.targetDoshas || []);
      setHealthGoals(product.healthGoals || []);
      setUsage(product.usage || product.dosage || '');
      setIndications(product.indications || '');
      setPackings(product.packings || ['450 ml']);
      
      const parsedIngredients: IngredientItem[] = (product.ingredients || []).map(item => {
        if (typeof item === 'string') {
          return { name: item };
        }
        return item;
      });
      setIngredients(parsedIngredients);
      setStatus(product.status || 'Active');
      setFeatured(!!product.featured);
      setBatchNumber(product.batchNumber || '');
    } else {
      // Defaults for new formulation
      setName('');
      setSanskritName('');
      setCode(`SA-${Math.floor(10000 + Math.random() * 90000)}`);
      setCategoryId(categories[0]?.id || 1);
      setClassicalReference('Ashtanga Hrudayam / AFI');
      setImages([
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
        'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600',
        'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600'
      ]);
      setImageUrl('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600');
      setDescription('');
      setPrimaryBenefit('');
      setDoshaImpact('Tridoshic');
      setTargetDoshas(['Tridoshic']);
      setHealthGoals(['Digestion & Motility']);
      setUsage('15 to 25 ml twice daily after food with warm water.');
      setIndications('');
      setPackings(['450 ml', '200 ml']);
      setIngredients([
        { name: 'Triphala Complex', botanicalName: 'Terminalia chebula et al.', partUsed: 'Fruit pericarp', classicalRole: 'Synergistic detoxifier' }
      ]);
      setStatus('Active');
      setFeatured(false);
      setBatchNumber(`SIT-2026-B${Math.floor(10 + Math.random() * 90)}`);
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddPacking = () => {
    if (packingInput.trim() && !packings.includes(packingInput.trim())) {
      setPackings([...packings, packingInput.trim()]);
      setPackingInput('');
    }
  };

  const handleRemovePacking = (pkg: string) => {
    setPackings(packings.filter(p => p !== pkg));
  };

  const handleAddIngredient = () => {
    if (newIngName.trim()) {
      setIngredients([
        ...ingredients,
        {
          name: newIngName.trim(),
          botanicalName: newIngBotanical.trim(),
          partUsed: newIngPart.trim(),
          classicalRole: newIngRole.trim()
        }
      ]);
      setNewIngName('');
      setNewIngBotanical('');
      setNewIngPart('');
      setNewIngRole('');
    }
  };

  const handleSelectExistingBotanical = (botanicalId: string) => {
    setSelectedBotanicalId(botanicalId);
    if (!botanicalId) return;
    const found = (availableIngredients || []).find(b => String(b.id) === String(botanicalId));
    if (found) {
      setNewIngName(found.name);
      setNewIngBotanical(found.botanicalName || '');
      setNewIngPart(found.partUsed || 'Root / Standardized part');
      setNewIngRole(found.therapeuticAction || '');
    }
  };

  const handleQuickAddExistingBotanical = (botanical: BotanicalIngredient) => {
    // Check if herb already exists in formulation
    if (ingredients.some(item => item.name.toLowerCase() === botanical.name.toLowerCase())) {
      alert(`"${botanical.name}" is already in this formulation.`);
      return;
    }
    setIngredients(prev => [
      ...prev,
      {
        name: botanical.name,
        botanicalName: botanical.botanicalName || '',
        partUsed: botanical.partUsed || 'Root / Standardized part',
        classicalRole: botanical.therapeuticAction || '',
        sanskritName: botanical.sanskritName || ''
      }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleDosha = (dosha: string) => {
    if (targetDoshas.includes(dosha)) {
      setTargetDoshas(targetDoshas.filter(d => d !== dosha));
    } else {
      setTargetDoshas([...targetDoshas, dosha]);
    }
  };

  const handleSetPhotoUrl = (index: number, url: string) => {
    const next = [...images];
    while (next.length <= index) {
      next.push('');
    }
    next[index] = url;
    setImages(next);
    if (index === 0) {
      setImageUrl(url);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    setImageUrl(next[0] || '');
  };

  const handleMakePrimary = (index: number) => {
    if (index === 0 || !images[index]) return;
    const target = images[index];
    const remaining = images.filter((_, i) => i !== index);
    const next = [target, ...remaining];
    setImages(next);
    setImageUrl(target);
  };

  const handleApplyPresetGroup = (count: 3 | 4) => {
    const presets3 = [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', // Bottle packaging
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600', // Herbal extract / Decoction
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600', // Pure Botanical Churna
    ];
    const presets4 = [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', // Bottle packaging
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', // Formulation Tablets / Gulika
      'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600', // Decoction extract
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600', // Dispensing Churna & Box
    ];
    const selected = count === 3 ? presets3 : presets4;
    setImages(selected);
    setImageUrl(selected[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter formulation name.');
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);
    const resolvedCatName = selectedCategory ? selectedCategory.name : (categories[0]?.name || '');

    const validImages = images.map(img => img.trim()).filter(Boolean);
    const primaryImg = validImages[0] || imageUrl.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';

    onSave({
      id: product?.id,
      name: name.trim(),
      categoryName: resolvedCatName,
      categoryId,
      sanskritName: sanskritName.trim(),
      code: code.trim() || `SA-${Math.floor(10000 + Math.random() * 90000)}`,
      classicalReference: classicalReference.trim(),
      imageUrl: primaryImg,
      images: validImages.length > 0 ? validImages : [primaryImg],
      description: description.trim(),
      primaryBenefit: primaryBenefit.trim(),
      doshaImpact: doshaImpact.trim(),
      targetDoshas,
      healthGoals,
      usage: usage.trim(),
      indications: indications.trim(),
      packings,
      ingredients,
      status,
      featured,
      batchNumber: batchNumber.trim() || 'SIT-2026-B1',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#081C13] border border-[#23493C] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#23493C] flex items-center justify-between bg-[#0D281C]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-serif font-bold text-lg text-gray-100">
                {product ? `Edit Medicine: ${product.name}` : 'New Ayurvedic Medicine'}
              </h2>
              <p className="text-xs text-emerald-400/80">Configure classical formulation parameters & inventory record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-emerald-900/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#23493C] bg-[#0A2218] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'general'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            1. Classification & Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'clinical'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            2. Clinical & Energetics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ingredients')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'ingredients'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            3. Botanical Ingredients & Sizes
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Commercial Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abhayarishtam, Triphala Churna"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Classical Sanskrit Name</label>
                  <input
                    type="text"
                    value={sanskritName}
                    onChange={(e) => setSanskritName(e.target.value)}
                    placeholder="e.g. अभयारिष्टम् (Traditional Fermented Elixir)"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Formulation Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Formulation Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SA-00001"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active (Published)</option>
                    <option value="Draft">Draft (Internal)</option>
                    <option value="Inactive">Inactive (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Group of 3 or 4 Medicine Photos */}
              <div className="bg-[#0A2218] border border-[#23493C] rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Medicine Photo Gallery (Group of 3 or 4 Photos)</span>
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Upload or link up to 4 angles: packaging bottle, back formulation label, medicine texture, and carton box.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] text-gray-400 mr-1 hidden sm:inline">Quick Fill:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetGroup(3)}
                      className="px-2.5 py-1 rounded-lg bg-[#081C13] border border-[#23493C] hover:border-emerald-500 text-[11px] text-emerald-300 font-medium transition cursor-pointer"
                      title="Load 3 standard Ayurvedic medicine photos"
                    >
                      ⚡ Group of 3
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetGroup(4)}
                      className="px-2.5 py-1 rounded-lg bg-[#081C13] border border-[#23493C] hover:border-emerald-500 text-[11px] text-emerald-300 font-medium transition cursor-pointer"
                      title="Load 4 standard Ayurvedic medicine photos"
                    >
                      ⚡ Group of 4
                    </button>
                  </div>
                </div>

                {/* 4 Photo Slots */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const slotLabels = [
                      'Photo 1 (Bottle Cover)',
                      'Photo 2 (Label / Back)',
                      'Photo 3 (Decoction / Herb)',
                      'Photo 4 (Box / Carton)'
                    ];
                    const currentImg = images[idx] || '';

                    return (
                      <div 
                        key={idx} 
                        className={`bg-[#081C13] border rounded-xl p-2.5 flex flex-col justify-between transition ${
                          currentImg ? 'border-emerald-700/60' : 'border-[#23493C] border-dashed hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5 font-medium">
                          <span className="truncate">{slotLabels[idx]}</span>
                          {idx === 0 && currentImg && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[9px]">
                              COVER
                            </span>
                          )}
                        </div>

                        {/* Thumbnail or Empty State */}
                        <div className="aspect-square w-full rounded-lg bg-[#0D281C] border border-[#23493C]/80 overflow-hidden relative group mb-2">
                          {currentImg ? (
                            <>
                              <img 
                                src={currentImg} 
                                alt={`Medicine view ${idx + 1}`} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMakePrimary(idx)}
                                    className="p-1 rounded bg-emerald-700 text-white text-[10px] hover:bg-emerald-600 cursor-pointer"
                                    title="Make this the cover photo"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="p-1 rounded bg-red-700 text-white text-[10px] hover:bg-red-600 cursor-pointer"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-center p-2">
                              <ImageIcon className="w-6 h-6 mb-1 text-emerald-800/80" />
                              <span className="text-[10px]">Photo {idx + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* URL input field */}
                        <input
                          type="url"
                          value={currentImg}
                          onChange={(e) => handleSetPhotoUrl(idx, e.target.value)}
                          placeholder="Paste image URL..."
                          className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-2 py-1 text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Pharmacological Summary / Short Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive clinical summary of the medicine, its indications, and therapeutic actions..."
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-[#23493C] text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-gray-300 select-none cursor-pointer">
                  Feature in Apothecary Highlights & Quick Prescribing Bar
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Classical Treatise Reference</label>
                <input
                  type="text"
                  value={classicalReference}
                  onChange={(e) => setClassicalReference(e.target.value)}
                  placeholder="e.g. Ashtangahrudayam, Arshorogadhikaram / AFI Vol. I"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Primary Clinical Benefit</label>
                <input
                  type="text"
                  value={primaryBenefit}
                  onChange={(e) => setPrimaryBenefit(e.target.value)}
                  placeholder="e.g. Eliminates chronic toxins, kindles agni, regulates bowel peristalsis"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Clinical Indications (Roga Rogadhikara)</label>
                <textarea
                  rows={2}
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  placeholder="e.g. Arshas (Hemorrhoids), Vibandha (Constipation), Agnimandya, Udara"
                  className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Dosage & Frequency</label>
                  <input
                    type="text"
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    placeholder="e.g. 15-25 ml twice daily after food"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-emerald-300 mb-1">Dosha Energetics Impact</label>
                  <input
                    type="text"
                    value={doshaImpact}
                    onChange={(e) => setDoshaImpact(e.target.value)}
                    placeholder="e.g. Pacifies aggravated Vata & Kapha"
                    className="w-full bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-2">Target Doshas</label>
                <div className="flex flex-wrap gap-2">
                  {['Vata', 'Pitta', 'Kapha', 'Tridoshic'].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDosha(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        targetDoshas.includes(d)
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-[#0D281C] text-gray-400 border-[#23493C]'
                      }`}
                    >
                      {d} {targetDoshas.includes(d) && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              
              {/* Packaging sizes */}
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">Available Packaging Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={packingInput}
                    onChange={(e) => setPackingInput(e.target.value)}
                    placeholder="e.g. 100 ml, 450 ml, 1 kg"
                    className="flex-1 bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-1.5 text-xs text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddPacking}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold hover:bg-emerald-900"
                  >
                    Add Size
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {packings.map((pkg) => (
                    <span key={pkg} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-[#0D281C] text-gray-200 border border-[#23493C]">
                      <span>{pkg}</span>
                      <button type="button" onClick={() => handleRemovePacking(pkg)} className="text-gray-400 hover:text-red-400">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="pt-2 border-t border-[#23493C]">
                <label className="block text-xs font-medium text-emerald-300 mb-2">Botanical Ingredients & Dravyaguna</label>
                
                {/* List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D281C] border border-[#23493C] text-xs">
                      <div>
                        <span className="font-bold text-emerald-300">{ing.name}</span>
                        {ing.botanicalName && <span className="text-gray-400 italic ml-2">({ing.botanicalName})</span>}
                        {ing.partUsed && <span className="text-amber-400/80 ml-2">[{ing.partUsed}]</span>}
                        {ing.classicalRole && <p className="text-[11px] text-gray-400 mt-0.5">{ing.classicalRole}</p>}
                      </div>
                      <button type="button" onClick={() => handleRemoveIngredient(i)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {ingredients.length === 0 && (
                    <p className="text-xs text-gray-500 italic py-2">No ingredients added yet.</p>
                  )}
                </div>

                {/* Add Herb Entry */}
                <div className="p-3.5 rounded-xl bg-[#0D281C]/70 border border-[#23493C] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] uppercase font-bold text-gray-300 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add Herb Entry</span>
                    </span>
                    {availableIngredients && availableIngredients.length > 0 && (
                      <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                        {availableIngredients.length} Indexed Botanicals Available
                      </span>
                    )}
                  </div>

                  {/* Option 1: Select from Existing Botanicals from Supabase */}
                  {availableIngredients && availableIngredients.length > 0 && (
                    <div className="bg-[#081C13] border border-emerald-800/60 rounded-xl p-3 space-y-2.5">
                      <label className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Select from Existing Pharmacopoeia Botanicals:</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-normal">Auto-fills botanical details</span>
                      </label>

                      <div className="flex gap-2">
                        <select
                          value={selectedBotanicalId}
                          onChange={(e) => handleSelectExistingBotanical(e.target.value)}
                          className="flex-1 bg-[#0D281C] border border-[#23493C] rounded-lg px-3 py-2 text-xs text-gray-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">— Choose from standardized botanicals ({availableIngredients.length} in database) —</option>
                          {availableIngredients.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} {b.botanicalName ? `(${b.botanicalName})` : ''} {b.partUsed ? `— ${b.partUsed}` : ''}
                            </option>
                          ))}
                        </select>

                        {selectedBotanicalId && (
                          <button
                            type="button"
                            onClick={() => {
                              const b = availableIngredients.find(item => String(item.id) === String(selectedBotanicalId));
                              if (b) {
                                handleQuickAddExistingBotanical(b);
                                setSelectedBotanicalId('');
                                setNewIngName('');
                                setNewIngBotanical('');
                                setNewIngPart('');
                                setNewIngRole('');
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 flex items-center gap-1 transition shadow-xs cursor-pointer"
                            title="Directly add this botanical to medicine formulation"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Quick Add</span>
                          </button>
                        )}
                      </div>

                      {/* Quick-add chips for fast selection */}
                      <div className="pt-2 border-t border-[#23493C]/60">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
                          <span>Quick add indexed botanicals:</span>
                          <span className="text-[9px] text-emerald-400/80">Click any herb to insert</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {availableIngredients.slice(0, 12).map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => handleQuickAddExistingBotanical(b)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#0D281C] hover:bg-emerald-900/60 border border-[#23493C] text-emerald-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                              title={`Botanical Latin: ${b.botanicalName || 'N/A'} • Part: ${b.partUsed || 'N/A'}`}
                            >
                              <Plus className="w-2.5 h-2.5 text-emerald-400" />
                              <span>{b.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Option 2: Manual entry or refine selected botanical fields */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-gray-400 font-medium block">
                      {selectedBotanicalId ? 'Refine or customize selected botanical fields:' : 'Or enter botanical details manually:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newIngName}
                        onChange={(e) => setNewIngName(e.target.value)}
                        placeholder="Common / Herb Name *"
                        className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newIngBotanical}
                        onChange={(e) => setNewIngBotanical(e.target.value)}
                        placeholder="Botanical Latin (e.g. Withania somnifera)"
                        className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={newIngPart}
                        onChange={(e) => setNewIngPart(e.target.value)}
                        placeholder="Part used (e.g. Root, Fruit rind)"
                        className="bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIngRole}
                        onChange={(e) => setNewIngRole(e.target.value)}
                        placeholder="Classical therapeutic role (e.g. Ama cleanser, Vata pacifier)"
                        className="flex-1 bg-[#081C13] border border-[#23493C] rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer shrink-0 transition"
                      >
                        + Add Herb
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#23493C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#23493C] text-gray-300 hover:text-white hover:bg-emerald-950 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{product ? 'Update Formulation' : 'Save Medicine'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
