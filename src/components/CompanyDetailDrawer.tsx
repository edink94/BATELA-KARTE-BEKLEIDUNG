import React from 'react';
import { BatelaRecord, CATEGORY_CONFIG, CategoryType } from '../types.ts';
import { X, MapPin, Building, Globe, ExternalLink, Navigation, CheckCircle, AlertTriangle, Layers, Copy, Check } from 'lucide-react';

interface CompanyDetailDrawerProps {
  record: BatelaRecord | null;
  onClose: () => void;
  sharedLocationRecords: BatelaRecord[];
  onSelectRecord: (record: BatelaRecord) => void;
}

export const CompanyDetailDrawer: React.FC<CompanyDetailDrawerProps> = ({
  record,
  onClose,
  sharedLocationRecords,
  onSelectRecord
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const cfg = CATEGORY_CONFIG[record.category];
  const isApproximated = record.positionQuality === 'approximated';
  const isCorrected = record.positionQuality === 'corrected';

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${record.company}, ${record.street}, ${record.plz} ${record.ort}`
  )}`;

  const osmUrl = `https://www.openstreetmap.org/?mlat=${record.lat}&mlon=${record.lng}#map=16/${record.lat}/${record.lng}`;

  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${record.lat},${record.lng}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(`${record.company}\n${record.street}\n${record.plz} ${record.ort}\n${record.country}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 z-40 flex flex-col transition-transform transform duration-300 ease-in-out">
      {/* Drawer Header */}
      <div
        className="p-4 border-b border-slate-200 flex items-start justify-between relative"
        style={{ borderTop: `4px solid ${cfg.color}` }}
      >
        <div className="pr-4">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
              style={{
                backgroundColor: cfg.bgLight,
                color: cfg.color,
                borderColor: cfg.color
              }}
            >
              {cfg.label}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              #{record.originalIndex} in PDF
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">{record.company}</h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Schließen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Category Description */}
        <div className="p-3 rounded-xl border bg-slate-50 border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-0.5">Status: {cfg.label}</div>
          <p className="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
        </div>

        {/* Address Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Adresse & Standort
            </h4>
            <button
              onClick={copyAddress}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs">
            <div className="font-semibold text-slate-800">{record.street}</div>
            <div className="text-slate-700">
              <span className="font-bold text-slate-900">{record.plz}</span> {record.ort}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 pt-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{record.country}</span>
            </div>
          </div>
        </div>

        {/* Geocoding Quality & Transparency */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Geodaten & Adressabgleich
          </h4>
          <div
            className={`p-3 rounded-xl border text-xs ${
              isApproximated
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : isCorrected
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1">
              {isApproximated ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Position: Ortslage angenähert</span>
                </>
              ) : isCorrected ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  <span>Position: Ausreißer korrigiert</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Position: Exakte Straßenadresse</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed mb-2">{record.qualityNote}</p>

            <div className="pt-2 border-t border-black/10 font-mono text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Koordinaten:</span>
                <span className="font-semibold">
                  {record.lat.toFixed(5)}, {record.lng.toFixed(5)}
                </span>
              </div>
              {record.originalLat !== record.lat && (
                <div className="flex justify-between text-slate-400">
                  <span>PDF Original:</span>
                  <span>
                    {record.originalLat.toFixed(5)}, {record.originalLng.toFixed(5)}
                  </span>
                </div>
              )}
              <div className="text-slate-600 text-[10px] truncate mt-1">
                Ref: {record.foundAddress}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-business at location selector */}
        {sharedLocationRecords.length > 1 && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Weitere Firmen an diesem Standort ({sharedLocationRecords.length})
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              An dieser Adresse/Koordinate befinden sich mehrere Geschäftspartner:
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {sharedLocationRecords.map((item) => {
                const isCurrent = item.id === record.id;
                const itemCfg = CATEGORY_CONFIG[item.category];
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectRecord(item)}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-400 font-semibold text-blue-900 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{item.company}</div>
                      <div className="text-[10px] text-slate-400">{item.street}</div>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border"
                      style={{
                        backgroundColor: itemCfg.bgLight,
                        color: itemCfg.color,
                        borderColor: itemCfg.color
                      }}
                    >
                      {itemCfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={routeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs shadow-2xs transition-colors"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>Route planen</span>
          </a>
        </div>
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>OpenStreetMap öffnen</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
};
