import React from 'react';
import { CategoryType, CATEGORY_CONFIG } from '../types.ts';
import { Users, UserCheck, Sparkles, Moon, UserX, AlertOctagon } from 'lucide-react';

interface KpiBarProps {
  totalCount: number;
  filteredCount: number;
  categoryStats: Record<CategoryType, { count: number; total: number; percentage: number }>;
  activeCategories: Record<CategoryType, boolean>;
  onToggleCategory: (cat: CategoryType) => void;
  onSoloCategory: (cat: CategoryType) => void;
}

export const KpiBar: React.FC<KpiBarProps> = ({
  totalCount,
  filteredCount,
  categoryStats,
  activeCategories,
  onToggleCategory,
  onSoloCategory
}) => {
  const categoryOrder: CategoryType[] = ['Customer', 'Prospects', 'Dormants', 'Ex-Customers', 'Passivated'];

  const getCategoryIcon = (cat: CategoryType) => {
    switch (cat) {
      case 'Customer':
        return <UserCheck className="w-4 h-4 text-[#2EAD62]" />;
      case 'Prospects':
        return <Sparkles className="w-4 h-4 text-[#8B5CF6]" />;
      case 'Dormants':
        return <Moon className="w-4 h-4 text-[#F59E0B]" />;
      case 'Ex-Customers':
        return <UserX className="w-4 h-4 text-[#3B82F6]" />;
      case 'Passivated':
        return <AlertOctagon className="w-4 h-4 text-[#EF4444]" />;
    }
  };

  const isAllActive = categoryOrder.every((c) => activeCategories[c]);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Gesamt Card */}
          <div
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isAllActive
                ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            onClick={() => {
              categoryOrder.forEach((c) => {
                if (!activeCategories[c]) onToggleCategory(c);
              });
            }}
            title="Alle Kategorien aktivieren"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                Gesamtbestand
              </span>
              <Users className="w-4 h-4 opacity-75" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold">{filteredCount}</span>
              <span className="text-[11px] opacity-70">von {totalCount}</span>
            </div>
            <div className="mt-1 text-[10px] opacity-75 flex items-center justify-between">
              <span>{Math.round((filteredCount / (totalCount || 1)) * 100)}% aktiv</span>
              <span className="underline text-[9px]">Alle ein</span>
            </div>
          </div>

          {/* Category Cards */}
          {categoryOrder.map((cat) => {
            const stat = categoryStats[cat];
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = activeCategories[cat];

            return (
              <div
                key={cat}
                onClick={() => onToggleCategory(cat)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onSoloCategory(cat);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none relative group ${
                  isActive
                    ? 'bg-white shadow-xs hover:shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 opacity-55 grayscale-[20%]'
                }`}
                style={{
                  borderColor: isActive ? cfg.color : '#e2e8f0',
                  borderLeftWidth: isActive ? '4px' : '1px'
                }}
                title={`${cfg.label}: ${cfg.description} (Klick: an/aus, Doppelklick: isolieren)`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider truncate"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <div className="p-1 rounded-md" style={{ backgroundColor: cfg.bgLight }}>
                    {getCategoryIcon(cat)}
                  </div>
                </div>

                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-slate-800">{stat.count}</span>
                  <span className="text-[11px] text-slate-400">/ {stat.total}</span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{Math.round((stat.total / totalCount) * 100)}% des Bestands</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isActive ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{
                      backgroundColor: cfg.color,
                      boxShadow: isActive ? `0 0 6px ${cfg.color}` : 'none'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
