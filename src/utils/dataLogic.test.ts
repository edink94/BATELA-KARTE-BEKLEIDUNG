import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterRecords,
  computeKpiStats,
  aggregateByTown,
  computeDataQualityStats,
  groupByCoordinates,
  INITIAL_FILTERS
} from './dataLogic.ts';
import type { FilterState } from './dataLogic.ts';
import type { BatelaRecord } from '../types.ts';

const mockRecords: BatelaRecord[] = [
  {
    id: '1',
    originalIndex: 1,
    category: 'Customer',
    rawCategory: 'Customer',
    company: 'Alpha Marine',
    street: 'Hafenstr. 1',
    plz: '24103',
    ort: 'Kiel',
    country: 'Deutschland',
    originalLat: 54.32,
    originalLng: 10.13,
    lat: 54.32,
    lng: 10.13,
    foundAddress: 'Hafenstr. 1, Kiel',
    positionQuality: 'exact',
    qualityNote: 'Exakt'
  },
  {
    id: '2',
    originalIndex: 2,
    category: 'Prospects',
    rawCategory: 'Prospect',
    company: 'Beta Segeln',
    street: 'Hafenstr. 1',
    plz: '24103',
    ort: 'Kiel',
    country: 'Deutschland',
    originalLat: 54.32,
    originalLng: 10.13,
    lat: 54.32,
    lng: 10.13,
    foundAddress: 'Hafenstr. 1, Kiel',
    positionQuality: 'exact',
    qualityNote: 'Exakt'
  },
  {
    id: '3',
    originalIndex: 3,
    category: 'Passivated',
    rawCategory: 'Passivated',
    company: 'Nordic Sylt Store',
    street: 'Strandstr. 4',
    plz: '25980',
    ort: 'Westerland / Sylt',
    country: 'Deutschland',
    originalLat: 51.16569,
    originalLng: 10.45153,
    lat: 54.91,
    lng: 8.34,
    foundAddress: 'Strandstr. 4, Westerland',
    positionQuality: 'approximated',
    qualityNote: 'Ortskoordinate ermittelt'
  }
];

test('computeKpiStats calculates correct totals and category counts', () => {
  const stats = computeKpiStats(mockRecords, mockRecords);
  assert.equal(stats.totalCount, 3);
  assert.equal(stats.filteredCount, 3);
  assert.equal(stats.byCategory.Customer.count, 1);
  assert.equal(stats.byCategory.Prospects.count, 1);
  assert.equal(stats.byCategory.Passivated.count, 1);
  assert.equal(stats.byCategory.Dormants.count, 0);
  assert.equal(stats.byCategory['Ex-Customers'].count, 0);
});

test('filterRecords filters by category', () => {
  const filters: FilterState = {
    ...INITIAL_FILTERS,
    categories: {
      Customer: true,
      Prospects: false,
      Dormants: false,
      'Ex-Customers': false,
      Passivated: false
    }
  };
  const filtered = filterRecords(mockRecords, filters);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].company, 'Alpha Marine');
});

test('filterRecords filters by search query on company, town, and street', () => {
  const f1 = filterRecords(mockRecords, { ...INITIAL_FILTERS, searchQuery: 'Sylt' });
  assert.equal(f1.length, 1);
  assert.equal(f1[0].company, 'Nordic Sylt Store');

  const f2 = filterRecords(mockRecords, { ...INITIAL_FILTERS, searchQuery: 'Hafenstr' });
  assert.equal(f2.length, 2);

  const f3 = filterRecords(mockRecords, { ...INITIAL_FILTERS, searchQuery: '24103' });
  assert.equal(f3.length, 2);
});

test('aggregateByTown groups records into towns with category counts', () => {
  const towns = aggregateByTown(mockRecords);
  assert.equal(towns.length, 2);
  const kiel = towns.find((t) => t.ort.toLowerCase().includes('kiel'));
  assert.ok(kiel);
  assert.equal(kiel?.totalCompanies, 2);
  assert.equal(kiel?.counts.Customer, 1);
  assert.equal(kiel?.counts.Prospects, 1);
});

test('groupByCoordinates groups shared coordinates at the same location', () => {
  const groups = groupByCoordinates(mockRecords);
  const kielCoordKey = `${(54.32).toFixed(5)},${(10.13).toFixed(5)}`;
  const kielList = groups.get(kielCoordKey);
  assert.ok(kielList);
  assert.equal(kielList?.length, 2);
});

test('computeDataQualityStats correctly tallies exact and approximated locations', () => {
  const dq = computeDataQualityStats(mockRecords);
  assert.equal(dq.totalInPdf, 3);
  assert.equal(dq.validPositions, 2);
  assert.equal(dq.approximatedPositions, 1);
  assert.equal(dq.unresolvablePositions, 0);
  assert.equal(dq.unassignedCategories, 0);
});
