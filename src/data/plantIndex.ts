import { PLANTS } from './plants';

export interface SearchEntry {
  normalized: string;
  deUmlauted: string;
  stemmed: string;
  plantId: string;
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
  // Remove common German plural/diminutive suffixes
  // Order matters: longest suffixes first
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

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const plant of PLANTS) {
    const allNames = [plant.name, ...plant.aliases];
    for (const name of allNames) {
      const normalized = normalizeGerman(name);
      entries.push({
        normalized,
        deUmlauted: deUmlaut(normalized),
        stemmed: stemGerman(deUmlaut(normalized)),
        plantId: plant.id,
      });
    }
  }

  return entries;
}

let _index: SearchEntry[] | null = null;

export function getSearchIndex(): SearchEntry[] {
  if (!_index) {
    _index = buildIndex();
  }
  return _index;
}
