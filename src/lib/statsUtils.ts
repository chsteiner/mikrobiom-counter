import { db } from '../data/db';
import { getWeekKeyOffset } from './weekUtils';

/**
 * Calculate streak: consecutive weeks (from current backwards) where
 * unique plant count >= threshold. Week 0 (current) doesn't break the
 * streak if it's below threshold (week might not be done yet).
 */
export async function calculateStreak(threshold: number): Promise<number> {
  let streak = 0;
  for (let i = 0; i <= 52; i++) {
    const weekKey = getWeekKeyOffset(i);
    const entries = await db.entries.where('weekKey').equals(weekKey).toArray();
    const unique = new Set(entries.map(e => e.plantId));
    if (unique.size >= threshold) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

/**
 * Get unique plant counts for the last N weeks (ordered oldest → newest).
 */
export async function getWeekHistory(numWeeks: number): Promise<{ weekKey: string; count: number }[]> {
  const weeks: { weekKey: string; count: number }[] = [];
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekKey = getWeekKeyOffset(i);
    const entries = await db.entries.where('weekKey').equals(weekKey).toArray();
    const unique = new Set(entries.map(e => e.plantId));
    weeks.push({ weekKey, count: unique.size });
  }
  return weeks;
}

/**
 * Get all unique plant IDs from weeks before the current week.
 */
export async function getHistoricalPlantIds(currentWeekKey: string): Promise<Set<string>> {
  const entries = await db.entries.where('weekKey').notEqual(currentWeekKey).toArray();
  return new Set(entries.map(e => e.plantId));
}

/**
 * Get total entry count across all weeks.
 */
export async function getTotalEntryCount(): Promise<number> {
  return db.entries.count();
}
