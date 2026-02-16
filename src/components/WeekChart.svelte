<script lang="ts">
  import { formatWeekLabel } from '../lib/weekUtils';

  interface WeekData {
    weekKey: string;
    count: number;
  }

  interface Props {
    weeks: WeekData[];
    goal: number;
  }

  let { weeks, goal }: Props = $props();

  let maxCount = $derived(Math.max(goal, ...weeks.map(w => w.count)));
</script>

<div class="chart">
  {#each weeks as week}
    {@const pct = maxCount > 0 ? (week.count / maxCount) * 100 : 0}
    {@const atGoal = week.count >= goal}
    <div class="bar-col">
      <span class="bar-value">{week.count}</span>
      <div class="bar-track">
        <div
          class="bar-fill"
          class:at-goal={atGoal}
          style="height: {pct}%"
        ></div>
      </div>
      <span class="bar-label">{formatWeekLabel(week.weekKey).replace(/,\s*\d+/, '')}</span>
    </div>
  {/each}
</div>

<style>
  .chart {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
    height: 160px;
    padding: 0.5rem 0;
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .bar-value {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .bar-track {
    width: 100%;
    max-width: 32px;
    height: 100px;
    background: var(--color-border);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }

  .bar-fill {
    width: 100%;
    background: var(--color-primary-light);
    border-radius: 4px;
    transition: height 0.3s ease;
    min-height: 2px;
  }

  .bar-fill.at-goal {
    background: var(--color-primary);
  }

  .bar-label {
    font-size: 0.6rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
</style>
