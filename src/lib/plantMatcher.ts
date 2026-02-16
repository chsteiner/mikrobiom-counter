import { getSearchIndex, type SearchEntry } from '../data/plantIndex';
import { PLANTS } from '../data/plants';
import type { Plant } from '../data/types';

export type MatchConfidence = 'exact' | 'high' | 'medium' | 'low' | 'none';

export interface MatchResult {
  plant: Plant | null;
  confidence: MatchConfidence;
  matchedTerm: string;
}

function normalizeGerman(s: string): string {
  return s.toLowerCase().trim();
}

function deUmlaut(s: string): string {
  return s
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

function stemGerman(s: string): string {
  return s
    .replace(/chen$/, '')
    .replace(/lein$/, '')
    .replace(/nen$/, 'n')
    .replace(/en$/, '')
    .replace(/er$/, '')
    .replace(/es$/, '')
    .replace(/e$/, '')
    .replace(/s$/, '')
    .replace(/n$/, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => {
    const row = new Array(n + 1);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findPlant(id: string): Plant | null {
  return PLANTS.find(p => p.id === id) ?? null;
}

// German food adjectives (all declined forms) to strip before matching
const FOOD_ADJECTIVES = new Set([
  // Colors
  'grün', 'grüne', 'grüner', 'grünes', 'grünen', 'grünem',
  'rot', 'rote', 'roter', 'rotes', 'roten', 'rotem',
  'gelb', 'gelbe', 'gelber', 'gelbes', 'gelben', 'gelbem',
  'schwarz', 'schwarze', 'schwarzer', 'schwarzes', 'schwarzen', 'schwarzem',
  'weiß', 'weiße', 'weißer', 'weißes', 'weißen', 'weißem',
  'braun', 'braune', 'brauner', 'braunes', 'braunen', 'braunem',
  'orange', 'orangene', 'orangener',
  // Freshness / preparation
  'frisch', 'frische', 'frischer', 'frisches',
  'getrocknet', 'getrocknete', 'getrockneter', 'getrocknetes',
  'tiefgekühlt', 'tiefgekühlte', 'tiefgekühlter',
  'roh', 'rohe', 'roher', 'rohes',
  'gekocht', 'gekochte', 'gekochter', 'gekochtes',
  'geröstet', 'geröstete', 'gerösteter', 'geröstetes',
  'geräuchert', 'geräucherte', 'geräucherter',
  'eingelegt', 'eingelegte', 'eingelegter', 'eingelegtes',
  // Size / type
  'klein', 'kleine', 'kleiner', 'kleines',
  'groß', 'große', 'großer', 'großes',
  'jung', 'junge', 'junger', 'junges',
  'wild', 'wilde', 'wilder', 'wildes',
  'bio',
]);

function stripFoodAdjectives(s: string): string {
  const words = s.split(/\s+/);
  if (words.length < 2) return s;
  // Strip leading adjectives
  let i = 0;
  while (i < words.length - 1 && FOOD_ADJECTIVES.has(words[i])) {
    i++;
  }
  return i > 0 ? words.slice(i).join(' ') : s;
}

/**
 * 4-tier fuzzy matching for German plant names.
 * Tier 1: Exact match against all aliases
 * Tier 2: De-umlauted or stemmed match
 * Tier 3: Prefix match (for partial speech results)
 * Tier 4: Levenshtein distance <= 2
 */
export function matchPlant(input: string): MatchResult {
  const index = getSearchIndex();
  const normalized = normalizeGerman(input);
  const deUmlauted = deUmlaut(normalized);
  const stemmed = stemGerman(deUmlauted);

  if (normalized.length < 2) {
    return { plant: null, confidence: 'none', matchedTerm: input };
  }

  // Tier 1: Exact match
  for (const entry of index) {
    if (entry.normalized === normalized) {
      return { plant: findPlant(entry.plantId), confidence: 'exact', matchedTerm: input };
    }
  }

  // Tier 2: De-umlauted or stemmed match
  for (const entry of index) {
    if (entry.deUmlauted === deUmlauted || entry.stemmed === stemmed) {
      return { plant: findPlant(entry.plantId), confidence: 'high', matchedTerm: input };
    }
  }

  // Tier 3: Prefix match (input is prefix of a plant name, or plant name is prefix of input)
  const prefixMatches: SearchEntry[] = [];
  for (const entry of index) {
    if (
      (entry.normalized.startsWith(normalized) && normalized.length >= 3) ||
      (normalized.startsWith(entry.normalized) && entry.normalized.length >= 3)
    ) {
      prefixMatches.push(entry);
    }
  }
  // Only use prefix match if it uniquely identifies one plant
  const uniquePlantIds = new Set(prefixMatches.map(e => e.plantId));
  if (uniquePlantIds.size === 1) {
    const plantId = prefixMatches[0].plantId;
    return { plant: findPlant(plantId), confidence: 'medium', matchedTerm: input };
  }

  // Tier 4: Levenshtein distance <= 2
  let bestMatch: SearchEntry | null = null;
  let bestDist = Infinity;
  for (const entry of index) {
    // Skip if length difference is too large (optimization)
    if (Math.abs(entry.normalized.length - normalized.length) > 2) continue;
    const dist = levenshtein(normalized, entry.normalized);
    if (dist < bestDist && dist <= 2) {
      bestDist = dist;
      bestMatch = entry;
    }
  }
  if (bestMatch) {
    return { plant: findPlant(bestMatch.plantId), confidence: 'low', matchedTerm: input };
  }

  // Tier 5: Strip food adjectives ("grüne Paprika" → "Paprika") and retry
  const stripped = stripFoodAdjectives(normalized);
  if (stripped !== normalized) {
    const retryResult = matchPlant(stripped);
    if (retryResult.confidence !== 'none') {
      return { ...retryResult, matchedTerm: input };
    }
  }

  return { plant: null, confidence: 'none', matchedTerm: input };
}

/**
 * Search plants by prefix for manual input autocomplete.
 * Returns up to `limit` matches sorted by relevance.
 */
export function searchPlants(query: string, limit = 10): Plant[] {
  if (query.length < 1) return [];

  const normalized = normalizeGerman(query);
  const deUmlauted = deUmlaut(normalized);
  const index = getSearchIndex();
  const seen = new Set<string>();
  const results: Plant[] = [];

  // Exact prefix matches first
  for (const entry of index) {
    if (entry.normalized.startsWith(normalized) || entry.deUmlauted.startsWith(deUmlauted)) {
      if (!seen.has(entry.plantId)) {
        seen.add(entry.plantId);
        const plant = findPlant(entry.plantId);
        if (plant) results.push(plant);
      }
    }
    if (results.length >= limit) return results;
  }

  // Then substring matches
  for (const entry of index) {
    if (entry.normalized.includes(normalized) || entry.deUmlauted.includes(deUmlauted)) {
      if (!seen.has(entry.plantId)) {
        seen.add(entry.plantId);
        const plant = findPlant(entry.plantId);
        if (plant) results.push(plant);
      }
    }
    if (results.length >= limit) return results;
  }

  return results;
}
