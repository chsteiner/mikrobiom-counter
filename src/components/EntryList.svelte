<script lang="ts">
  import type { PlantEntry } from '../data/types';

  interface Props {
    entries: PlantEntry[];
    onremove: (id: number) => void;
  }

  let { entries, onremove }: Props = $props();

  // Show most recent first, deduplicated by plantId (keep latest)
  let recentUnique = $derived.by(() => {
    const seen = new Set<string>();
    const result: PlantEntry[] = [];
    for (let i = entries.length - 1; i >= 0; i--) {
      if (!seen.has(entries[i].plantId)) {
        seen.add(entries[i].plantId);
        result.push(entries[i]);
      }
    }
    return result.slice(0, 8);
  });

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'gerade eben';
    if (min < 60) return `vor ${min} Min.`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    return 'heute';
  }
</script>

{#if recentUnique.length > 0}
  <div class="entry-list">
    <h3>Zuletzt hinzugefügt</h3>
    <ul>
      {#each recentUnique as entry}
        <li>
          <span class="entry-name">{entry.plantName}</span>
          <span class="entry-time">{timeAgo(entry.timestamp)}</span>
          <button class="entry-remove" onclick={() => {
            if (entry.id != null) onremove(entry.id);
          }}>✕</button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .entry-list {
    width: 100%;
    max-width: 400px;
  }

  h3 {
    font-size: 0.8rem;
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
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
    gap: 0.5rem;
  }

  .entry-name {
    flex: 1;
    font-size: 0.9rem;
  }

  .entry-time {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .entry-remove {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.75rem;
  }
</style>
