import React, { useState, useMemo, useCallback } from 'react';
import { BATELA_RECORDS } from './data/batelaDataset.ts';
import { BatelaRecord, CategoryType, TownSummary } from './types.ts';
import {
  filterRecords,
  computeKpiStats,
  aggregateByTown,
  computeDataQualityStats,
  INITIAL_FILTERS,
  FilterState
} from './utils/dataLogic.ts';
import { MapView } from './components/MapView.tsx';
import { CompanyDetailDrawer } from './components/CompanyDetailDrawer.tsx';
import { TownsTable } from './components/TownsTable.tsx';
import { DataQualityAudit } from './components/DataQualityAudit.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { Building2, ShieldCheck, Download, X } from 'lucide-react';

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState<BatelaRecord | null>(null);
  const [showTownSummaries, setShowTownSummaries] = useState<boolean>(true);
  
  // Modals for secondary tools so the map stays in 100% focus
  const [activeModal, setActiveModal] = useState<'towns' | 'audit' | 'export' | null>(null);

  // Compute filtered records
  const filteredRecords = useMemo(() => {
    return filterRecords(BATELA_RECORDS, filters);
  }, [filters]);

  // Autocomplete suggestions based on search query
  const suggestedRecords = useMemo(() => {
    if (!filters.searchQuery.trim()) return [];
    return filteredRecords.slice(0, 8);
  }, [filteredRecords, filters.searchQuery]);

  // KPI statistics (both current selection & total)
  const kpiStats = useMemo(() => {
    return computeKpiStats(filteredRecords, BATELA_RECORDS);
  }, [filteredRecords]);

  // Aggregation by towns
  const townSummaries = useMemo(() => {
    return aggregateByTown(filteredRecords);
  }, [filteredRecords]);

  // Data Quality stats
  const dataQualityStats = useMemo(() => {
    return computeDataQualityStats(BATELA_RECORDS);
  }, []);

  // Shared location records for selected company
  const sharedLocationRecords = useMemo(() => {
    if (!selectedRecord) return [];
    const coordKey = `${selectedRecord.lat.toFixed(5)},${selectedRecord.lng.toFixed(5)}`;
    return BATELA_RECORDS.filter(
      (r) => `${r.lat.toFixed(5)},${r.lng.toFixed(5)}` === coordKey
    );
  }, [selectedRecord]);

  // Handlers
  const handleToggleCategory = useCallback((cat: CategoryType) => {
    setFilters((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: !prev.categories[cat]
      }
    }));
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      categories: {
        Customer: true,
        Prospects: true,
        Dormants: true,
        'Ex-Customers': true,
        Passivated: true
      }
    }));
  }, []);

  const handleDeselectAllCategories = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      categories: {
        Customer: false,
        Prospects: false,
        Dormants: false,
        'Ex-Customers': false,
        Passivated: false
      }
    }));
  }, []);

  const handleSelectTown = useCallback((town: TownSummary) => {
    setActiveModal(null);
    const match = BATELA_RECORDS.find((r) => r.id === town.recordIds[0]);
    if (match) {
      setSelectedRecord(match);
    }
  }, []);

  const handleSelectRecord = useCallback((record: BatelaRecord) => {
    setActiveModal(null);
    setSelectedRecord(record);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 font-sans antialiased select-none">
      {/* Fullscreen Map View - Primary Focus */}
      <MapView
        records={filteredRecords}
        selectedRecord={selectedRecord}
        onSelectRecord={handleSelectRecord}
        showTownSummaries={showTownSummaries}
        townSummaries={townSummaries}
        onSelectTown={handleSelectTown}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        suggestedRecords={suggestedRecords}
        activeCategories={filters.categories}
        categoryStats={kpiStats.byCategory}
        onToggleCategory={handleToggleCategory}
        onSelectAllCategories={handleSelectAllCategories}
        onDeselectAllCategories={handleDeselectAllCategories}
        onOpenTowns={() => setActiveModal('towns')}
        onOpenAudit={() => setActiveModal('audit')}
        onOpenExport={() => setActiveModal('export')}
        onToggleTownSummaries={() => setShowTownSummaries((prev) => !prev)}
        totalCount={BATELA_RECORDS.length}
        filteredCount={filteredRecords.length}
      />

      {/* Slide-over Company Detail Card */}
      {selectedRecord && (
        <CompanyDetailDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          sharedLocationRecords={sharedLocationRecords}
          onSelectRecord={handleSelectRecord}
        />
      )}

      {/* Ortsübersicht Modal */}
      {activeModal === 'towns' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Ortsübersicht</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TownsTable
                townSummaries={townSummaries}
                onSelectTown={handleSelectTown}
                filteredCount={filteredRecords.length}
              />
            </div>
          </div>
        </div>
      )}

      {/* Datenqualität Audit Modal */}
      {activeModal === 'audit' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Datenqualität & PDF-Audit</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DataQualityAudit
                stats={dataQualityStats}
                allRecords={BATELA_RECORDS}
                onSelectRecord={handleSelectRecord}
              />
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={activeModal === 'export'}
        onClose={() => setActiveModal(null)}
        filteredRecords={filteredRecords}
      />
    </div>
  );
}
