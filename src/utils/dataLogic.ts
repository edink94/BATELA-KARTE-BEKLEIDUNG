import type { BatelaRecord, CategoryType, TownSummary, DataQualityStats } from '../types.ts';

export interface FilterState {
  categories: Record<CategoryType, boolean>;
  searchQuery: string;
  qualityFilter: 'all' | 'exact' | 'approximated' | 'corrected';
  countryFilter: string; // 'all' or specific
}

export const INITIAL_FILTERS: FilterState = {
  categories: {
    Customer: true,
    Prospects: true,
    Dormants: true,
    'Ex-Customers': true,
    Passivated: true
  },
  searchQuery: '',
  qualityFilter: 'all',
  countryFilter: 'all'
};

export function filterRecords(records: BatelaRecord[], filters: FilterState): BatelaRecord[] {
  const query = filters.searchQuery.trim().toLowerCase();
  
  return records.filter((r) => {
    // Category filter
    if (!filters.categories[r.category]) {
      return false;
    }

    // Quality filter
    if (filters.qualityFilter !== 'all' && r.positionQuality !== filters.qualityFilter) {
      return false;
    }

    // Country filter
    if (filters.countryFilter !== 'all' && r.country !== filters.countryFilter) {
      return false;
    }

    // Search query
    if (query) {
      const match =
        r.company.toLowerCase().includes(query) ||
        r.ort.toLowerCase().includes(query) ||
        r.plz.toLowerCase().includes(query) ||
        r.street.toLowerCase().includes(query) ||
        r.foundAddress.toLowerCase().includes(query);
      if (!match) return false;
    }

    return true;
  });
}

export function computeKpiStats(
  filtered: BatelaRecord[],
  total: BatelaRecord[]
): {
  totalCount: number;
  filteredCount: number;
  byCategory: Record<CategoryType, { count: number; total: number; percentage: number }>;
} {
  const categories: CategoryType[] = ['Customer', 'Prospects', 'Dormants', 'Ex-Customers', 'Passivated'];

  const byCategory = {} as Record<CategoryType, { count: number; total: number; percentage: number }>;

  for (const cat of categories) {
    const catTotal = total.filter((r) => r.category === cat).length;
    const catFiltered = filtered.filter((r) => r.category === cat).length;
    const percentage = total.length > 0 ? Math.round((catFiltered / total.length) * 100) : 0;
    byCategory[cat] = {
      count: catFiltered,
      total: catTotal,
      percentage
    };
  }

  return {
    totalCount: total.length,
    filteredCount: filtered.length,
    byCategory
  };
}

export function aggregateByTown(records: BatelaRecord[]): TownSummary[] {
  const map = new Map<string, TownSummary>();

  for (const r of records) {
    // Normalise town name for grouping (e.g. trim)
    const townName = r.ort || 'Unbekannt';
    const key = townName.toLowerCase();

    let entry = map.get(key);
    if (!entry) {
      entry = {
        ort: townName,
        plzSample: r.plz,
        lat: r.lat,
        lng: r.lng,
        totalCompanies: 0,
        counts: {
          Customer: 0,
          Prospects: 0,
          Dormants: 0,
          'Ex-Customers': 0,
          Passivated: 0
        },
        recordIds: []
      };
      map.set(key, entry);
    }

    entry.totalCompanies++;
    entry.counts[r.category]++;
    entry.recordIds.push(r.id);
  }

  return Array.from(map.values()).sort((a, b) => b.totalCompanies - a.totalCompanies);
}

export function computeDataQualityStats(records: BatelaRecord[]): DataQualityStats {
  const totalInPdf = records.length;
  const importedSuccessfully = records.length;
  const validPositions = records.filter((r) => r.positionQuality === 'exact').length;
  const approximatedPositions = records.filter((r) => r.positionQuality === 'approximated').length;
  const correctedOutliers = records.filter((r) => r.positionQuality === 'corrected').length;
  const unresolvablePositions = records.filter(
    (r) => !r.lat || !r.lng || isNaN(r.lat) || isNaN(r.lng)
  ).length;
  const unassignedCategories = records.filter((r) => !r.category).length;

  return {
    totalInPdf,
    importedSuccessfully,
    validPositions,
    approximatedPositions,
    correctedOutliers,
    unresolvablePositions,
    unassignedCategories
  };
}

/**
 * Group records by identical coordinates to support spiderfying / address tab selection
 */
export function groupByCoordinates(records: BatelaRecord[]): Map<string, BatelaRecord[]> {
  const groups = new Map<string, BatelaRecord[]>();
  for (const r of records) {
    // Key by rounded lat, lng (approx 1-2 meters precision: 5 decimals)
    const key = `${r.lat.toFixed(5)},${r.lng.toFixed(5)}`;
    const list = groups.get(key) || [];
    list.push(r);
    groups.set(key, list);
  }
  return groups;
}
