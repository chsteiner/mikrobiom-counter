import { db } from '../data/db';
import { getISOWeekKey } from '../lib/weekUtils';
import type { PlantEntry, WeekSummary } from '../data/types';

const currentWeekKey = $state(getISOWeekKey());
let entries = $state<PlantEntry[]>([]);

async function loadEntries(weekKey: string) {
  entries = await db.entries.where('weekKey').equals(weekKey).sortBy('timestamp');
}

function getSummary(): WeekSummary {
  const seen = new Set<string>();
  for (const e of entries) {
    seen.add(e.plantId);
  }
  return {
    weekKey: currentWeekKey,
    uniquePlants: [...seen],
    count: seen.size,
    goal: 30,
    entries,
  };
}

export function getWeekStore() {
  // Load on first access
  loadEntries(currentWeekKey);

  return {
    get weekKey() { return currentWeekKey; },
    get entries() { return entries; },
    get summary(): WeekSummary { return getSummary(); },

    async addEntry(plantId: string, plantName: string, source: 'voice' | 'manual') {
      await db.entries.add({
        plantId,
        plantName,
        weekKey: currentWeekKey,
        timestamp: Date.now(),
        source,
      });
      await loadEntries(currentWeekKey);
    },

    async removeEntry(id: number) {
      await db.entries.delete(id);
      await loadEntries(currentWeekKey);
    },

    async refresh() {
      await loadEntries(currentWeekKey);
    },
  };
}
