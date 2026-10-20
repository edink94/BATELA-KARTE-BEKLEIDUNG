export type CategoryType = 'Customer' | 'Prospects' | 'Dormants' | 'Ex-Customers' | 'Passivated';

export type PositionQuality = 'exact' | 'approximated' | 'corrected';

export interface BatelaRecord {
  id: string;
  originalIndex: number;
  category: CategoryType;
  rawCategory: string;
  company: string;
  street: string;
  plz: string;
  ort: string;
  country: string;
  originalLat: number;
  originalLng: number;
  lat: number;
  lng: number;
  foundAddress: string;
  positionQuality: PositionQuality;
  qualityNote: string;
}

export interface CategoryMeta {
  key: CategoryType;
  label: string;
  description: string;
  color: string;
  bgLight: string;
  borderClass: string;
  badgeClass: string;
}

export const CATEGORY_CONFIG: Record<CategoryType, CategoryMeta> = {
  Customer: {
    key: 'Customer',
    label: 'Customer',
    description: 'Bestehende Kunden mit aktiver Geschäftsbeziehung',
    color: '#2EAD62',
    bgLight: 'rgba(46, 173, 98, 0.12)',
    borderClass: 'border-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  Prospects: {
    key: 'Prospects',
    label: 'Prospects',
    description: 'Potenzielle Neukunden für zukünftige Partnerschaften',
    color: '#8B5CF6',
    bgLight: 'rgba(139, 92, 246, 0.12)',
    borderClass: 'border-purple-500',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300'
  },
  Dormants: {
    key: 'Dormants',
    label: 'Dormants',
    description: 'Ruhende Beziehungen mit geringer/keiner Aktivität',
    color: '#F59E0B',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    borderClass: 'border-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300'
  },
  'Ex-Customers': {
    key: 'Ex-Customers',
    label: 'Ex-Customers',
    description: 'Ehemalige Kunden, die nicht mehr aktiv bestellen',
    color: '#3B82F6',
    bgLight: 'rgba(59, 130, 246, 0.12)',
    borderClass: 'border-blue-500',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-300'
  },
  Passivated: {
    key: 'Passivated',
    label: 'Passivated',
    description: 'Stillgelegte oder deaktivierte Geschäftsbeziehungen',
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    borderClass: 'border-red-500',
    badgeClass: 'bg-red-50 text-red-700 border-red-300'
  }
};

export interface TownSummary {
  ort: string;
  plzSample: string;
  lat: number;
  lng: number;
  totalCompanies: number;
  counts: Record<CategoryType, number>;
  recordIds: string[];
}

export interface DataQualityStats {
  totalInPdf: number;
  importedSuccessfully: number;
  validPositions: number;
  approximatedPositions: number;
  correctedOutliers: number;
  unresolvablePositions: number;
  unassignedCategories: number;
}
