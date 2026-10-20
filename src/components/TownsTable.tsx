import React, { useState, useMemo } from 'react';
import { TownSummary, CATEGORY_CONFIG, CategoryType, BatelaRecord } from '../types.ts';
import { Building2, ArrowUpDown, Search, MapPin, ChevronRight, UserCheck, Sparkles, Moon, UserX, AlertOctagon } from 'lucide-react';

interface TownsTableProps {
  townSummaries: TownSummary[];
  onSelectTown: (town: TownSummary) => void;
  filteredCount: number;
}

type SortField = 'total' | 'Customer' | 'Prospects' | 'Dormants' | 'Ex-Customers' | 'Passivated' | 'ort';

export const TownsTable: React.FC<TownsTableProps> = ({
  townSummaries,
  onSelectTown,
  filteredCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredTowns = useMemo(() => {
    let list = townSummaries;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) => t.ort.toLowerCase().includes(q) || t.plzSample.includes(q));
    }

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'ort') {
        cmp = a.ort.localeCompare(b.ort);
      } else if (sortField === 'total') {
        cmp = b.totalCompanies - a.totalCompanies;
      } else {
        cmp = b.counts[sortField as CategoryType] - a.counts[sortField as CategoryType];
      }
      return sortAsc ? -cmp : cmp;
    });
  }, [townSummaries, searchTerm, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Ortsübersicht ({townSummaries.length} Städte & Orte)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Übersicht aller Geschäftsbeziehungen nach Städten und Regionen ({filteredCount} Unternehmen im aktuellen Filter). Klick auf einen Ort öffnet die Kartenansicht.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ort oder PLZ filtern..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Towns Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('ort')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Ort / Region</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Gesamt</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Customer')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-[#2EAD62]">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Customer</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Prospects')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-[#8B5CF6]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prospects</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Dormants')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-[#F59E0B]">
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dormants</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Ex-Customers')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-[#3B82F6]">
                    <UserX className="w-3.5 h-3.5" />
                    <span>Ex-Cust.</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Passivated')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1 text-[#EF4444]">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Passivated</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Karte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTowns.map((town, idx) => (
                <tr
                  key={town.ort + idx}
                  onClick={() => onSelectTown(town)}
                  className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-semibold text-slate-800">{town.ort}</span>
                      <span className="text-[10px] text-slate-400 font-mono">PLZ: {town.plzSample}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                      {town.totalCompanies}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#2EAD62]">
                    {town.counts.Customer > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        {town.counts.Customer}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#8B5CF6]">
                    {town.counts.Prospects > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                        {town.counts.Prospects}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#F59E0B]">
                    {town.counts.Dormants > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                        {town.counts.Dormants}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#3B82F6]">
                    {town.counts['Ex-Customers'] > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                        {town.counts['Ex-Customers']}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-[#EF4444]">
                    {town.counts.Passivated > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                        {town.counts.Passivated}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-800">
                      Anfliegen <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTowns.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Keine Orte gefunden für Suchbegriff "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
