import React from 'react';
import { Pill, CheckCircle2, AlertTriangle, Layers, UserCheck } from 'lucide-react';
import { Product, Category, User } from '../../types';

interface StatsBarProps {
  products: Product[];
  categories: Category[];
  users: User[];
  onFilterLowStock: () => void;
  isLowStockFilterActive: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  products,
  categories,
  users,
  onFilterLowStock,
  isLowStockFilterActive
}) => {
  const totalCount = products.length;
  const activeCount = products.filter(p => p.status === 'Active').length;
  const lowStockCount = products.filter(p => (p.stockUnits || 0) < 25).length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stockUnits || 0), 0);
  const practitionerCount = users.filter(u => u.role === 'PRACTITIONER' || u.role === 'ADMIN').length;

  const stats = [
    {
      title: 'Total Medicines',
      value: totalCount,
      detail: `${totalStockUnits.toLocaleString()} total units in stock`,
      icon: Pill,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/60',
      borderColor: 'border-emerald-800/50'
    },
    {
      title: 'Active Formulations',
      value: activeCount,
      detail: `${Math.round((activeCount / (totalCount || 1)) * 100)}% published in clinic`,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bgColor: 'bg-teal-950/60',
      borderColor: 'border-teal-800/50'
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockCount,
      detail: lowStockCount > 0 ? 'Requires immediate batch restock' : 'All formulations optimal',
      icon: AlertTriangle,
      color: lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: lowStockCount > 0 ? 'bg-amber-950/60' : 'bg-emerald-950/40',
      borderColor: lowStockCount > 0 ? 'border-amber-700/60' : 'border-emerald-800/50',
      clickable: true,
      onClick: onFilterLowStock,
      active: isLowStockFilterActive
    },
    {
      title: 'Classical Categories',
      value: categories.length,
      detail: 'Arishta, Churna, Vati, Thailam',
      icon: Layers,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/40',
      borderColor: 'border-yellow-800/40'
    },
    {
      title: 'Clinical Personnel',
      value: practitionerCount,
      detail: `${users.length} registered system users`,
      icon: UserCheck,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40',
      borderColor: 'border-sky-800/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            onClick={stat.clickable ? stat.onClick : undefined}
            className={`p-3.5 rounded-xl border backdrop-blur-md transition ${stat.bgColor} ${stat.borderColor} ${
              stat.clickable ? 'cursor-pointer hover:scale-[1.02] select-none' : ''
            } ${stat.active ? 'ring-2 ring-amber-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-300">{stat.title}</span>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold font-serif text-white tracking-tight">
              {stat.value}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 truncate">
              {stat.detail}
            </p>
          </div>
        );
      })}
    </div>
  );
};
