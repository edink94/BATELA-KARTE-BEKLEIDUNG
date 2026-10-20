import React, { useState } from 'react';
import { BatelaRecord } from '../types.ts';
import { X, Download, FileSpreadsheet, Code, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredRecords: BatelaRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filteredRecords
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = [
      'ID',
      'Kategorie',
      'Firma',
      'Strasse',
      'PLZ',
      'Ort',
      'Land',
      'Latitude',
      'Longitude',
      'Positionsqualitaet',
      'Referenzadresse'
    ];

    const rows = filteredRecords.map((r) => [
      r.originalIndex,
      r.category,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.street.replace(/"/g, '""')}"`,
      `"${r.plz}"`,
      `"${r.ort.replace(/"/g, '""')}"`,
      `"${r.country}"`,
      r.lat,
      r.lng,
      r.positionQuality,
      `"${r.foundAddress.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `BATELA_Vertriebsdaten_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredRecords, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `BATELA_Vertriebsdaten_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Datensatz exportieren
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600">
            Aktuell sind <strong>{filteredRecords.length} Standorte</strong> gefiltert.
            Wähle das gewünschte Format für den Export:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportCSV}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-800 text-sm">Excel / CSV</div>
              <div className="text-slate-500 mt-1">
                Semikolon-getrennt mit UTF-8 BOM für Microsoft Excel
              </div>
            </button>

            <button
              onClick={exportJSON}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group"
            >
              <Code className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-slate-800 text-sm">JSON</div>
              <div className="text-slate-500 mt-1">
                Vollständig strukturierte Rohdaten mit Geokoordinaten
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
