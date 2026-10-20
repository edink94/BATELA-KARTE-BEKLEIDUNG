import React, { useState, useRef, useEffect } from 'react';
import { CategoryType, CATEGORY_CONFIG, BatelaRecord } from '../types.ts';
import { Search, X, CheckSquare, Square, Filter, ChevronDown, Check, Globe, MapPin, Eye, EyeOff } from 'lucide-react';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategories: Record<CategoryType, boolean>;
  onToggleCategory: (cat: CategoryType) => void;
  onSelectAllCategories: () => void;
  onDeselectAllCategories: () => void;
  qualityFilter: 'all' | 'exact' | 'approximated' | 'corrected';
  onQualityFilterChange: (quality: 'all' | 'exact' | 'approximated' | 'corrected') => void;
  countryFilter: string;
  onCountryFilterChange: (country: string) => void;
  showTownSummaries: boolean;
  onToggleTownSummaries: () => void;
  suggestedRecords: BatelaRecord[];
  onSelectRecord: (record: BatelaRecord) => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  onSelectAllCategories,
  onDeselectAllCategories,
  qualityFilter,
  onQualityFilterChange,
  countryFilter,
  onCountryFilterChange,
  showTownSummaries,
  onToggleTownSummaries,
  suggestedRecords,
  onSelectRecord
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const categoryList: CategoryType[] = ['Customer', 'Prospects', 'Dormants', 'Ex-Customers', 'Passivated'];

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input with Autocomplete */}
        <div className="relative flex-1 min-w-[280px] max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Suche nach Firma, Ort, PLZ oder Straße..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSuggestions(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Suche leeren"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && searchQuery.trim().length > 1 && suggestedRecords.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-72 overflow-y-auto z-50 divide-y divide-slate-100"
            >
              <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Gefundene Unternehmen ({suggestedRecords.length})</span>
                <span className="text-[10px] text-slate-400">Klick zum Ansteuern</span>
              </div>
              {suggestedRecords.slice(0, 8).map((record) => {
                const cfg = CATEGORY_CONFIG[record.category];
                return (
                  <button
                    key={record.id}
                    onClick={() => {
                      onSelectRecord(record);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{record.company}</div>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {record.street}, {record.plz} {record.ort}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 border"
                      style={{
                        backgroundColor: cfg.bgLight,
                        color: cfg.color,
                        borderColor: cfg.color
                      }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Filters Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categoryList.map((cat) => {
            const isActive = activeCategories[cat];
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'shadow-2xs text-slate-800'
                    : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isActive ? cfg.bgLight : '#ffffff',
                  borderColor: isActive ? cfg.color : '#e2e8f0',
                  color: isActive ? '#0f172a' : '#64748b'
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span>{cfg.label}</span>
                {isActive ? (
                  <Check className="w-3 h-3 ml-0.5" style={{ color: cfg.color }} />
                ) : (
                  <X className="w-3 h-3 ml-0.5 text-slate-300" />
                )}
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Alle / Keiner Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onSelectAllCategories}
              className="p-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1"
              title="Alle Kategorien auswählen"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline text-[11px]">Alle</span>
            </button>
            <button
              onClick={onDeselectAllCategories}
              className="p-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1"
              title="Alle Kategorien abwählen"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline text-[11px]">Keine</span>
            </button>
          </div>
        </div>

        {/* Quality, Country & Layer Toggles */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Quality dropdown */}
          <select
            value={qualityFilter}
            onChange={(e) => onQualityFilterChange(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            title="Filter nach Geocoding-Qualität"
          >
            <option value="all">Alle Positionen</option>
            <option value="exact">Nur exakte Adressen</option>
            <option value="approximated">Angenäherte Orte</option>
            <option value="corrected">Korrigierte Outlier</option>
          </select>

          {/* Country selector */}
          <select
            value={countryFilter}
            onChange={(e) => onCountryFilterChange(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            title="Länderfilter"
          >
            <option value="all">Alle Länder</option>
            <option value="Deutschland">Deutschland</option>
            <option value="Dänemark">Dänemark</option>
            <option value="Polen">Polen</option>
            <option value="Schweden">Schweden</option>
            <option value="Schweiz">Schweiz</option>
            <option value="Niederlande">Niederlande</option>
          </select>

          {/* Town summaries toggle button */}
          <button
            onClick={onToggleTownSummaries}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showTownSummaries
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Orts-Zusammenfassungen auf der Karte an/aus"
          >
            {showTownSummaries ? (
              <Eye className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">Ortsmarker</span>
          </button>
        </div>
      </div>
    </div>
  );
};
