<script lang="ts">
  import { db } from '../data/db';
  import { getISOWeekKey, getWeekKeyOffset } from '../lib/weekUtils';
  import { getSettingsStore } from '../stores/settingsStore';
  import WeekChart from '../components/WeekChart.svelte';
  import type { PlantEntry } from '../data/types';

  const { settings } = getSettingsStore();

  interface WeekData {
    weekKey: string;
    count: number;
  }

  let weekHistory = $state<WeekData[]>([]);
  let allEntries = $state<PlantEntry[]>([]);

  async function loadHistory() {
    allEntries = await db.entries.toArray();

    // Build last 8 weeks
    const weeks: WeekData[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekKey = getWeekKeyOffset(i);
      const weekEntries = allEntries.filter(e => e.weekKey === weekKey);
      const unique = new Set(weekEntries.map(e => e.plantId));
      weeks.push({ weekKey, count: unique.size });
    }
    weekHistory = weeks;
  }

  let currentWeekCount = $derived(
    weekHistory.find(w => w.weekKey === getISOWeekKey())?.count ?? 0
  );

  let average = $derived.by(() => {
    const nonEmpty = weekHistory.filter(w => w.count > 0);
    if (nonEmpty.length === 0) return 0;
    return Math.round(nonEmpty.reduce((sum, w) => sum + w.count, 0) / nonEmpty.length);
  });

  let best = $derived(
    Math.max(0, ...weekHistory.map(w => w.count))
  );

  let streak = $derived.by(() => {
    let count = 0;
    for (let i = weekHistory.length - 1; i >= 0; i--) {
      if (weekHistory[i].count >= settings.streakThreshold) {
        count++;
      } else {
        break;
      }
    }
    return count;
  });

  $effect(() => {
    loadHistory();
  });
</script>

<div class="stats-view">
  <h2>Statistik</h2>

  <div class="stat-cards">
    <div class="stat-card">
      <span class="stat-value">{currentWeekCount}</span>
      <span class="stat-label">Diese Woche</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{average}</span>
      <span class="stat-label">Durchschnitt</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{best}</span>
      <span class="stat-label">Beste Woche</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{streak}</span>
      <span class="stat-label">Wochen-Serie</span>
    </div>
  </div>

  <section class="chart-section">
    <h3>Letzte 8 Wochen</h3>
    {#if weekHistory.length > 0}
      <WeekChart weeks={weekHistory} goal={settings.weeklyGoal} />
    {/if}
  </section>

  <p class="streak-info">
    Serie: Aufeinanderfolgende Wochen mit mind. {settings.streakThreshold} Pflanzen.
  </p>
</div>

<style>
  .stats-view {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .stat-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .chart-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
  }

  .chart-section h3 {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .streak-info {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-align: center;
  }
</style>
