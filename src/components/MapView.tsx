import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { BatelaRecord, CATEGORY_CONFIG, CategoryType, TownSummary } from '../types.ts';
import {
  Search,
  X,
  MapPin,
  ExternalLink,
  ChevronRight,
  Navigation,
  Compass,
  Building2,
  ShieldCheck,
  Download,
  Check,
  Layers,
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react';

interface MapViewProps {
  records: BatelaRecord[];
  selectedRecord: BatelaRecord | null;
  onSelectRecord: (record: BatelaRecord) => void;
  showTownSummaries: boolean;
  townSummaries: TownSummary[];
  onSelectTown: (town: TownSummary) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestedRecords: BatelaRecord[];
  activeCategories: Record<CategoryType, boolean>;
  categoryStats: Record<CategoryType, { count: number; total: number; percentage: number }>;
  onToggleCategory: (cat: CategoryType) => void;
  onSelectAllCategories: () => void;
  onDeselectAllCategories: () => void;
  onOpenTowns: () => void;
  onOpenAudit: () => void;
  onOpenExport: () => void;
  onToggleTownSummaries: () => void;
  totalCount: number;
  filteredCount: number;
}

// Region Presets for Germany & Surrounding areas
const REGION_PRESETS = [
  { name: 'Gesamt', bounds: [[47.2, 5.8], [55.1, 15.1]] as L.LatLngBoundsExpression },
  { name: 'Nordseeküste', bounds: [[53.3, 6.5], [55.1, 9.2]] as L.LatLngBoundsExpression },
  { name: 'Ostseeküste', bounds: [[53.7, 9.8], [54.8, 14.4]] as L.LatLngBoundsExpression },
  { name: 'Hamburg', bounds: [[53.35, 9.6], [53.85, 10.4]] as L.LatLngBoundsExpression },
  { name: 'Berlin', bounds: [[52.2, 12.8], [52.75, 13.8]] as L.LatLngBoundsExpression },
  { name: 'Süddeutschland', bounds: [[47.4, 7.5], [49.8, 13.2]] as L.LatLngBoundsExpression },
];

export const MapView: React.FC<MapViewProps> = ({
  records,
  selectedRecord,
  onSelectRecord,
  showTownSummaries,
  townSummaries,
  onSelectTown,
  searchQuery,
  onSearchChange,
  suggestedRecords,
  activeCategories,
  categoryStats,
  onToggleCategory,
  onSelectAllCategories,
  onDeselectAllCategories,
  onOpenTowns,
  onOpenAudit,
  onOpenExport,
  onToggleTownSummaries,
  totalCount,
  filteredCount
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const townMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [currentZoom, setCurrentZoom] = useState<number>(6);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const categoryList: CategoryType[] = ['Customer', 'Prospects', 'Dormants', 'Ex-Customers', 'Passivated'];

  // Group records by coordinate key to detect multiple businesses at the same position
  const recordsByCoord = useMemo(() => {
    const map = new Map<string, BatelaRecord[]>();
    for (const r of records) {
      const key = `${r.lat.toFixed(5)},${r.lng.toFixed(5)}`;
      const list = map.get(key) || [];
      list.push(r);
      map.set(key, list);
    }
    return map;
  }, [records]);

  // Create SVG Pin Icon
  const createPinIcon = (category: CategoryType, isSelected: boolean, countAtLocation: number) => {
    const color = CATEGORY_CONFIG[category]?.color || '#3B82F6';
    const size = isSelected ? 42 : 32;
    const badgeHtml =
      countAtLocation > 1
        ? `<span style="position:absolute;top:-4px;right:-4px;background:#0f172a;color:#ffffff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:999px;border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${countAtLocation}</span>`
        : '';

    const svg = `
      <div style="position:relative;width:${size}px;height:${size}px;" class="batela-custom-pin">
        <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow-${size}" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
          </filter>
          <path d="M18 34C18 34 31 22.5 31 14C31 6.82 25.18 1 18 1C10.82 1 5 6.82 5 14C5 22.5 18 34 18 34Z" 
                fill="${color}" 
                stroke="#FFFFFF" 
                stroke-width="${isSelected ? '2.5' : '1.8'}"
                filter="url(#shadow-${size})"
          />
          <circle cx="18" cy="14" r="5.5" fill="#FFFFFF"/>
          <circle cx="18" cy="14" r="3.2" fill="${color}"/>
        </svg>
        ${badgeHtml}
      </div>
    `;

    return L.divIcon({
      html: svg,
      className: 'batela-pin-wrapper',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size + 4]
    });
  };

  // Create Custom Town Summary Marker
  const createTownIcon = (town: TownSummary) => {
    return L.divIcon({
      html: `
        <div class="batela-town-marker">
          <span style="font-weight:700;color:#1e293b;">${town.ort}</span>
          <span style="background:#0284c7;color:white;padding:1px 6px;border-radius:999px;font-size:10px;font-weight:700;">${town.totalCompanies}</span>
        </div>
      `,
      className: 'batela-town-marker-wrapper',
      iconSize: [110, 26],
      iconAnchor: [55, 13]
    });
  };

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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on Germany
    const map = L.map(mapContainerRef.current, {
      center: [52.8, 10.5],
      zoom: 6,
      zoomControl: false,
      minZoom: 4,
      maxZoom: 18
    });

    // Add Tile Layer: Official OpenStreetMap for keyless, crisp cartography
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom Control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initialize Cluster Group with spiderfying and custom cluster icon
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1.5,
      iconCreateFunction: (cluster) => {
        const childMarkers = cluster.getAllChildMarkers();
        const count = childMarkers.length;

        let diameter = 34;
        let fontSize = 12;
        if (count >= 50) {
          diameter = 46;
          fontSize = 14;
        } else if (count >= 15) {
          diameter = 40;
          fontSize = 13;
        }

        return L.divIcon({
          html: `
            <div class="batela-cluster-marker" style="
              width:${diameter}px;
              height:${diameter}px;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              border: 2.5px solid #38bdf8;
              font-size: ${fontSize}px;
            ">
              ${count}
            </div>
          `,
          className: 'batela-cluster-container',
          iconSize: [diameter, diameter],
          iconAnchor: [diameter / 2, diameter / 2]
        });
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Town markers layer
    const townLayer = L.layerGroup();
    map.addLayer(townLayer);
    townMarkersLayerRef.current = townLayer;

    // Track zoom level
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when records or selectedRecord changes
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    records.forEach((record) => {
      const isSelected = selectedRecord?.id === record.id;
      const coordKey = `${record.lat.toFixed(5)},${record.lng.toFixed(5)}`;
      const allAtCoord = recordsByCoord.get(coordKey) || [record];
      const countAtCoord = allAtCoord.length;

      const icon = createPinIcon(record.category, isSelected, countAtCoord);
      const marker = L.marker([record.lat, record.lng], {
        icon,
        title: record.company
      });

      // Construct interactive popup HTML
      const cfg = CATEGORY_CONFIG[record.category];
      const isApproximated = record.positionQuality === 'approximated';
      const isCorrected = record.positionQuality === 'corrected';

      let otherCompaniesHtml = '';
      if (countAtCoord > 1) {
        otherCompaniesHtml = `
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0;">
            <div style="font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px;">
              Weitere ${countAtCoord - 1} Firma(en) an diesem Ort:
            </div>
            <div style="max-height:80px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;">
              ${allAtCoord
                .filter((r) => r.id !== record.id)
                .map(
                  (other) => `
                    <div style="font-size:11px;display:flex;justify-content:space-between;gap:4px;color:#334155;">
                      <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${other.company}</span>
                      <span style="color:${CATEGORY_CONFIG[other.category]?.color};font-weight:600;font-size:10px;">${other.category}</span>
                    </div>
                  `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      const qualityBadgeHtml = isApproximated
        ? `<span style="font-size:10px;background:#fef3c7;color:#92400e;padding:1px 6px;border-radius:4px;font-weight:600;">Ortslage angenähert</span>`
        : isCorrected
        ? `<span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:1px 6px;border-radius:4px;font-weight:600;">Geokoordinate korrigiert</span>`
        : `<span style="font-size:10px;background:#ecfdf5;color:#065f46;padding:1px 6px;border-radius:4px;font-weight:600;">Exakte Adresse</span>`;

      const popupHtml = `
        <div style="padding:12px 14px;font-family:system-ui,sans-serif;min-width:240px;max-width:300px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:${cfg.color};background:${cfg.bgLight};padding:2px 8px;border-radius:999px;border:1px solid ${cfg.color};">
              ${cfg.label}
            </span>
            ${qualityBadgeHtml}
          </div>

          <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 4px 0;line-height:1.2;">
            ${record.company}
          </h3>

          <div style="font-size:12px;color:#475569;margin-bottom:8px;">
            <div>${record.street}</div>
            <div><strong>${record.plz}</strong> ${record.ort} (${record.country})</div>
          </div>

          ${otherCompaniesHtml}

          <div style="margin-top:10px;display:flex;gap:6px;">
            <button id="btn-select-${record.id}" style="
              flex:1;
              background:#2563eb;
              color:white;
              border:none;
              border-radius:6px;
              padding:6px 10px;
              font-size:12px;
              font-weight:600;
              cursor:pointer;
              display:flex;
              align-items:center;
              justify-content:center;
              gap:4px;
            ">
              Details öffnen
            </button>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${record.company}, ${record.street}, ${record.plz} ${record.ort}`
            )}" target="_blank" rel="noopener noreferrer" style="
              background:#f1f5f9;
              color:#334155;
              border:1px solid #cbd5e1;
              border-radius:6px;
              padding:6px 8px;
              font-size:11px;
              text-decoration:none;
              display:flex;
              align-items:center;
              justify-content:center;
            " title="In Google Maps öffnen">
              Maps ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${record.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectRecord(record);
          };
        }
      });

      marker.on('click', () => {
        onSelectRecord(record);
      });

      clusterGroup.addLayer(marker);
      markersMapRef.current.set(record.id, marker);
      bounds.extend([record.lat, record.lng]);
    });

    if (bounds.isValid() && records.length > 0 && !selectedRecord) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [records, selectedRecord, recordsByCoord, onSelectRecord]);

  // Handle selectedRecord focus
  useEffect(() => {
    if (!selectedRecord || !mapRef.current) return;
    const map = mapRef.current;
    map.flyTo([selectedRecord.lat, selectedRecord.lng], 15, {
      duration: 1.2
    });

    const marker = markersMapRef.current.get(selectedRecord.id);
    if (marker) {
      setTimeout(() => {
        if (clusterGroupRef.current) {
          clusterGroupRef.current.zoomToShowLayer(marker, () => {
            marker.openPopup();
          });
        } else {
          marker.openPopup();
        }
      }, 700);
    }
  }, [selectedRecord]);

  // Update Town Summary Markers
  useEffect(() => {
    const townLayer = townMarkersLayerRef.current;
    if (!townLayer) return;

    townLayer.clearLayers();

    if (showTownSummaries && currentZoom >= 7 && currentZoom <= 11) {
      townSummaries.slice(0, 40).forEach((town) => {
        if (!town.lat || !town.lng) return;
        const icon = createTownIcon(town);
        const marker = L.marker([town.lat, town.lng], { icon, zIndexOffset: -100 });
        marker.on('click', () => {
          onSelectTown(town);
        });
        townLayer.addLayer(marker);
      });
    }
  }, [showTownSummaries, townSummaries, currentZoom, onSelectTown]);

  return (
    <div className="relative w-full h-full bg-slate-100 flex flex-col">
      {/* Fullscreen Map Element */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Floating Top Header & Search Bar (Clean, Map-first, Modern) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-md w-[calc(100vw-32px)] sm:w-96">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-xl border border-slate-200 space-y-2">
          {/* Logo & Search Input */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Firma, Ort, PLZ oder Straße suchen..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          {showSuggestions && searchQuery.trim().length > 1 && suggestedRecords.length > 0 && (
            <div
              ref={suggestionsRef}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100"
            >
              <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                <span>Suchergebnisse ({suggestedRecords.length})</span>
                <span className="text-slate-400">Klick zum Anfliegen</span>
              </div>
              {suggestedRecords.map((r) => {
                const cfg = CATEGORY_CONFIG[r.category];
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRecord(r);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50/70 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{r.company}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {r.street}, {r.plz} {r.ort}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border"
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

          {/* Quick Region Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-0.5">
              <Navigation className="w-3 h-3 text-blue-600" />
            </span>
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.fitBounds(preset.bounds, { padding: [25, 25] });
                  }
                }}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors shrink-0"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Subdued Secondary Action Bar */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTowns}
                className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Städte</span>
              </button>
              <button
                onClick={onOpenAudit}
                className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Audit</span>
              </button>
              <button
                onClick={onOpenExport}
                className="text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>
            </div>

            <button
              onClick={onToggleTownSummaries}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              title="Ortsnamen-Marker auf der Karte an/aus"
            >
              {showTownSummaries ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Ortsmarker</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Center-Right Action: Re-center */}
      <button
        onClick={() => {
          if (mapRef.current && records.length > 0) {
            const bounds = L.latLngBounds(records.map((r) => [r.lat, r.lng]));
            mapRef.current.fitBounds(bounds, { padding: [35, 35] });
          }
        }}
        className="absolute top-16 right-3 z-20 p-2.5 bg-white/95 hover:bg-white text-slate-700 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center transition-all"
        title="Gesamte Karte zentrieren"
      >
        <Maximize2 className="w-4 h-4 text-slate-700" />
      </button>

      {/* Kleine, übersichtliche Legende mit Geschäftsbeziehungen (Wie vom Nutzer gewünscht) */}
      <div className="absolute bottom-5 left-4 z-20">
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 w-60 text-xs">
          {/* Legend Title with Filter Count */}
          <div className="flex items-center justify-between font-bold text-slate-800 pb-2 mb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-900 font-extrabold text-[12px] uppercase tracking-wide">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              BATELA Partner
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {filteredCount} / {totalCount}
            </span>
          </div>

          {/* Category List with Exact Hex Colors & Click-to-Toggle */}
          <div className="space-y-1.5">
            {categoryList.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const stat = categoryStats[cat];
              const isActive = activeCategories[cat];

              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-lg transition-all text-left group ${
                    isActive
                      ? 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-medium'
                      : 'opacity-40 hover:opacity-75 text-slate-400 bg-transparent'
                  }`}
                  title={`${cfg.label}: ${cfg.description} (Klick zum Ein-/Ausblenden)`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 transition-transform ${
                        isActive ? 'ring-2 ring-offset-1 group-hover:scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: cfg.color,
                        boxShadow: isActive ? `0 0 6px ${cfg.color}88` : 'none'
                      }}
                    />
                    <span className="text-xs">{cfg.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    <span className={isActive ? 'text-slate-700' : 'text-slate-400'}>
                      {stat.count}
                    </span>
                    {isActive ? (
                      <Check className="w-3 h-3 text-slate-500" />
                    ) : (
                      <span className="w-3 inline-block" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick toggle all */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <button
              onClick={onSelectAllCategories}
              className="hover:text-blue-600 font-semibold transition-colors"
            >
              Alle ein
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={onDeselectAllCategories}
              className="hover:text-slate-800 transition-colors"
            >
              Alle aus
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400">Zoom: {currentZoom}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
