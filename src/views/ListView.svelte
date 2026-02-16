<script lang="ts">
  import { CATEGORY_LABELS, type PlantCategory, type PlantEntry } from '../data/types';
  import { PLANTS } from '../data/plants';
  import { formatWeekLabel } from '../lib/weekUtils';

  interface Props {
    weekKey: string;
    entries: PlantEntry[];
    onremove: (id: number) => void;
  }

  let { weekKey, entries, onremove }: Props = $props();

  // Group unique plants by category
  let grouped = $derived.by(() => {
    const seen = new Map<string, PlantEntry>();
    for (const e of entries) {
      if (!seen.has(e.plantId)) seen.set(e.plantId, e);
    }

    const groups = new Map<PlantCategory, { name: string; entry: PlantEntry }[]>();
    for (const [plantId, entry] of seen) {
      const plant = PLANTS.find(p => p.id === plantId);
      const cat: PlantCategory = plant?.category ?? 'gemuese';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push({ name: entry.plantName, entry });
    }

    // Sort categories by label
    const order: PlantCategory[] = ['gemuese', 'obst', 'nuesse', 'samen', 'huelsenfruechte', 'getreide', 'kraeuter', 'gewuerze'];
    return order
      .filter(cat => groups.has(cat))
      .map(cat => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        plants: groups.get(cat)!.sort((a, b) => a.name.localeCompare(b.name, 'de')),
      }));
  });
</script>

<div class="list-view">
  <h2>{formatWeekLabel(weekKey)} — Deine Pflanzen</h2>

  {#if grouped.length === 0}
    <p class="empty">Noch keine Pflanzen diese Woche. Starte auf der Home-Seite!</p>
  {:else}
    {#each grouped as group}
      <section class="category-group">
        <h3>{group.label} ({group.plants.length})</h3>
        <ul>
          {#each group.plants as plant}
            <li>
              <span class="plant-name">{plant.name}</span>
              <button class="remove-btn" onclick={() => {
                if (plant.entry.id != null) onremove(plant.entry.id);
              }}>✕</button>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  .list-view {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  .empty {
    color: var(--color-text-muted);
    text-align: center;
    margin-top: 2rem;
  }

  .category-group {
    margin-bottom: 1.25rem;
  }

  .category-group h3 {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .plant-name {
    font-size: 0.95rem;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px 8px;
    font-size: 0.8rem;
  }
</style>
