import React from 'react';
import { Pill, CheckCircle2, Layers, UserCheck, Sparkles } from 'lucide-react';
import { Product, Category, User } from '../../types';

interface StatsBarProps {
  products: Product[];
  categories: Category[];
  users: User[];
}

export const StatsBar: React.FC<StatsBarProps> = ({
  products,
  categories,
  users,
}) => {
  const totalCount = products.length;
  const activeCount = products.filter(p => p.status === 'Active').length;
  const practitionerCount = users.filter(u => u.role === 'PRACTITIONER' || u.role === 'ADMIN').length;
  const totalBotanicals = products.reduce((acc, p) => acc + (p.ingredients?.length || 0), 0);

  const stats = [
    {
      title: 'Total Medicines',
      value: totalCount,
      detail: 'Standardized classical formulas',
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
      title: 'Classical Categories',
      value: categories.length,
      detail: 'Arishta, Churna, Vati, Thailam',
      icon: Layers,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/40',
      borderColor: 'border-yellow-800/40'
    },
    {
      title: 'Herbal Ingredients',
      value: totalBotanicals,
      detail: 'Dravyaguna indexed botanicals',
      icon: Sparkles,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-800/40'
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
            className={`p-3.5 rounded-xl border backdrop-blur-md transition ${stat.bgColor} ${stat.borderColor}`}
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
