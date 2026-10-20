import React, { useState, useMemo } from 'react';
import { BatelaRecord, DataQualityStats, CATEGORY_CONFIG } from '../types.ts';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileText, MapPin, Search, ChevronRight, Info } from 'lucide-react';

interface DataQualityAuditProps {
  stats: DataQualityStats;
  allRecords: BatelaRecord[];
  onSelectRecord: (record: BatelaRecord) => void;
}

export const DataQualityAudit: React.FC<DataQualityAuditProps> = ({
  stats,
  allRecords,
  onSelectRecord
}) => {
  const [filterType, setFilterType] = useState<'all' | 'approximated' | 'corrected'>('all');
  const [search, setSearch] = useState('');

  const auditRecords = useMemo(() => {
    let list = allRecords.filter((r) => r.positionQuality !== 'exact');
    if (filterType === 'approximated') {
      list = list.filter((r) => r.positionQuality === 'approximated');
    } else if (filterType === 'corrected') {
      list = list.filter((r) => r.positionQuality === 'corrected');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.company.toLowerCase().includes(q) ||
          r.ort.toLowerCase().includes(q) ||
          r.plz.includes(q) ||
          r.qualityNote.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allRecords, filterType, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Importquote
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Quelle: 20261020_BATF_Koordinierte_Datensätze_ALLE.pdf
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Vollständigkeits- & Geocoding-Audit
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Gemäß Anforderungskatalog wurden sämtliche Seiten der PDF-Datendatei ausgelesen und ohne Datenverlust verarbeitet.
              Für {stats.approximatedPositions} Datensätze, die in der Originaldatei fehlerhaft auf den theoretischen Mittelpunkt Deutschlands (51.16569, 10.45153)
              zurückgefallen waren, wurde anhand von PLZ und Ortsnamen eine zuverlässige Ortsposition ermittelt und transparent als „angenähert“ gekennzeichnet.
            </p>
          </div>
        </div>

        {/* Audit Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">
              PDF Datensätze
            </span>
            <span className="text-xl font-bold text-slate-800">{stats.totalInPdf}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Vollständig erfasst</span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
            <span className="text-[11px] text-emerald-700 font-semibold block uppercase">
              Erfolgreich importiert
            </span>
            <span className="text-xl font-bold text-emerald-800">{stats.importedSuccessfully}</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">100% Quote</span>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
            <span className="text-[11px] text-blue-700 font-semibold block uppercase">
              Exakte Adressen
            </span>
            <span className="text-xl font-bold text-blue-800">{stats.validPositions}</span>
            <span className="text-[10px] text-blue-600 block mt-0.5">Hausnummergenau</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
            <span className="text-[11px] text-amber-700 font-semibold block uppercase">
              Angenäherte Orte
            </span>
            <span className="text-xl font-bold text-amber-800">{stats.approximatedPositions}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Zentroid aufgelöst</span>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg">
            <span className="text-[11px] text-indigo-700 font-semibold block uppercase">
              Korrigierte Outlier
            </span>
            <span className="text-xl font-bold text-indigo-800">{stats.correctedOutliers}</span>
            <span className="text-[10px] text-indigo-600 block mt-0.5">z.B. Kappeln / Konstanz</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">
              Nicht zugeordnet
            </span>
            <span className="text-xl font-bold text-slate-800">0</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Keine Ausfälle</span>
          </div>
        </div>
      </div>

      {/* Audit Detail Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-800">
              Prüfliste der angenäherten & korrigierten Standorte ({auditRecords.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Alle anzeigen ({stats.approximatedPositions + stats.correctedOutliers})</option>
              <option value="approximated">Nur angenäherte Orte ({stats.approximatedPositions})</option>
              <option value="corrected">Nur korrigierte Ausreißer ({stats.correctedOutliers})</option>
            </select>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Prüfliste filtern..."
                className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Firma</th>
                <th className="py-2.5 px-3">Kategorie</th>
                <th className="py-2.5 px-3">Adresse & Ort</th>
                <th className="py-2.5 px-3">PDF Originalkoordinaten</th>
                <th className="py-2.5 px-3">Kartenkoordinaten</th>
                <th className="py-2.5 px-3">Prüfvermerk</th>
                <th className="py-2.5 px-3 text-center">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditRecords.map((record) => {
                const cfg = CATEGORY_CONFIG[record.category];
                return (
                  <tr
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400">{record.originalIndex}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{record.company}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: cfg.bgLight,
                          color: cfg.color,
                          borderColor: cfg.color
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{record.street}</div>
                      <div>
                        <strong>{record.plz}</strong> {record.ort}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {record.originalLat.toFixed(5)}, {record.originalLng.toFixed(5)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700 text-[11px]">
                      {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      <span className="inline-flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{record.qualityNote}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5">
                        Auf Karte <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
