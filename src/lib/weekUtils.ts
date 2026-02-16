/**
 * Returns ISO 8601 week key like "2026-W08".
 * Weeks start on Monday (German/ISO standard).
 */
export function getISOWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Returns Monday 00:00 and Sunday 23:59:59 for a given week key.
 */
export function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);

  // January 4th is always in week 1 (ISO 8601)
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;

  // Monday of week 1
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

  // Monday of target week
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  // Sunday 23:59:59.999
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Returns a human-readable label for a week key, e.g. "KW 8, 2026"
 */
export function formatWeekLabel(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split('-W');
  return `KW ${parseInt(weekStr)}, ${yearStr}`;
}

/**
 * Returns the week key for N weeks ago from the given reference.
 */
export function getWeekKeyOffset(offset: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - offset * 7);
  return getISOWeekKey(d);
}
