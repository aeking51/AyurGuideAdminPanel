import React, { useState } from 'react';
import { Boxes, AlertTriangle, Plus, Minus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types';

interface InventoryViewProps {
  products: Product[];
  onUpdateStock: (id: string | number, delta: number) => void;
  onEditProduct: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onUpdateStock,
  onEditProduct
}) => {
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = products.filter(p => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.code || '').toLowerCase().includes(q) && !(p.batchNumber || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    const isLow = (p.stockUnits || 0) < 25;
    if (filter === 'LOW') return isLow;
    if (filter === 'OPTIMAL') return !isLow;
    return true;
  });

  const lowStockCount = products.filter(p => (p.stockUnits || 0) < 25).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stockUnits || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0D281C] border border-[#23493C] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif font-bold text-xl text-gray-100">Dispensary Inventory & Batch Management</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Real-time tracking of dispensary stock, lot release authorizations, and automated reorder threshold triggers.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#081C13] border border-[#23493C] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Units</span>
            <span className="font-mono text-xl font-bold text-emerald-300">{totalUnits.toLocaleString()}</span>
          </div>
          <div className="bg-[#081C13] border border-[#23493C] px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Low Stock Alerts</span>
            <span className={`font-mono text-xl font-bold ${lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D281C]/80 p-4 rounded-xl border border-[#23493C]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-[#081C13] text-gray-300 hover:text-white'
            }`}
          >
            All Stock ({products.length})
          </button>
          <button
            onClick={() => setFilter('LOW')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'LOW' ? 'bg-amber-700 text-white' : 'bg-[#081C13] text-amber-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Critical ({lowStockCount})</span>
          </button>
          <button
            onClick={() => setFilter('OPTIMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'OPTIMAL' ? 'bg-emerald-900 text-emerald-300' : 'bg-[#081C13] text-gray-300 hover:text-white'
            }`}
          >
            Optimal Levels
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by medicine, code, or batch..."
          className="w-full sm:w-72 bg-[#081C13] border border-[#23493C] rounded-lg px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(product => {
          const isLow = (product.stockUnits || 0) < 25;
          const isOut = (product.stockUnits || 0) <= 0;

          return (
            <div
              key={product.id}
              className={`p-4 rounded-xl border transition ${
                isOut
                  ? 'bg-red-950/30 border-red-800/60'
                  : isLow
                  ? 'bg-amber-950/30 border-amber-700/60'
                  : 'bg-[#0D281C] border-[#23493C]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-serif font-bold text-gray-100 text-sm hover:text-emerald-300 cursor-pointer" onClick={() => onEditProduct(product)}>
                    {product.name}
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">{product.code}</span>
                  <span className="text-xs text-gray-400 block mt-0.5">{product.categoryName}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  isOut ? 'bg-red-900 text-red-200' : isLow ? 'bg-amber-900 text-amber-200' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {isOut ? 'DEPLETED' : isLow ? 'REORDER' : 'HEALTHY'}
                </span>
              </div>

              {/* Batch info */}
              <div className="flex items-center justify-between text-xs py-2 border-y border-[#23493C]/60 my-2">
                <span className="text-gray-400">Batch Lot:</span>
                <span className="font-mono text-gray-200 font-bold">{product.batchNumber || 'SIT-2026-B1'}</span>
              </div>

              {/* Units & Quick Restock */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 block font-bold">On Hand:</span>
                  <span className="font-mono text-xl font-bold text-white">{product.stockUnits ?? 0} <span className="text-xs text-gray-400 font-normal">units</span></span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStock(product.id, -10)}
                    disabled={isOut}
                    className="px-2 py-1 bg-[#081C13] border border-[#23493C] text-gray-300 hover:text-white rounded text-xs font-mono disabled:opacity-40"
                    title="Deduct 10 units"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => onUpdateStock(product.id, 25)}
                    className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 rounded text-xs font-mono font-bold"
                    title="Restock +25 units"
                  >
                    +25
                  </button>
                  <button
                    onClick={() => onUpdateStock(product.id, 50)}
                    className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 rounded text-xs font-mono font-bold"
                    title="Restock +50 units"
                  >
                    +50
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
