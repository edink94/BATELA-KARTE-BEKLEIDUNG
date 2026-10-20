import React from 'react';
import { MapPin, Building2, ShieldCheck, Download, RefreshCw, Compass } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'towns' | 'audit';
  onTabChange: (tab: 'map' | 'towns' | 'audit') => void;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
  onExportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalCount,
  filteredCount,
  onResetFilters,
  onExportClick
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-lg uppercase bg-gradient-to-r from-blue-300 via-white to-blue-200 bg-clip-text text-transparent">
                  BATELA
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 font-medium">
                  Sales Map Germany & EU
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interaktive Vertriebskarte & Potenzialanalyse ({filteredCount} von {totalCount} Standorten aktiv)
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60" aria-label="Ansichten">
            <button
              onClick={() => onTabChange('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Karte</span>
            </button>
            <button
              onClick={() => onTabChange('towns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'towns'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Ortsübersicht</span>
            </button>
            <button
              onClick={() => onTabChange('audit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Datenqualität</span>
              <span className="sm:hidden">Audit</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              title="Alle Filter zurücksetzen"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Zurücksetzen</span>
            </button>
            <button
              onClick={onExportClick}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
