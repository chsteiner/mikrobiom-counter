<script lang="ts">
  import { searchPlants } from '../lib/plantMatcher';
  import { PLANTS } from '../data/plants';
  import { CATEGORY_LABELS, type Plant, type PlantCategory } from '../data/types';

  interface Props {
    onconfirm: (plants: { id: string; name: string }[]) => void;
    onclose: () => void;
    existingPlantIds?: Set<string>;
  }

  let { onconfirm, onclose, existingPlantIds = new Set() }: Props = $props();

  let query = $state('');
  let selected = $state<Map<string, string>>(new Map());
  let inputEl: HTMLInputElement;

  let results = $derived(query.length > 0 ? searchPlants(query, 20) : []);

  // Group all plants by category for browse mode
  const grouped = (() => {
    const map = new Map<PlantCategory, Plant[]>();
    for (const plant of PLANTS) {
      if (!map.has(plant.category)) map.set(plant.category, []);
      map.get(plant.category)!.push(plant);
    }
    return map;
  })();

  const categoryOrder: PlantCategory[] = [
    'gemuese', 'obst', 'nuesse', 'samen', 'huelsenfruechte',
    'getreide', 'kraeuter', 'gewuerze', 'pilze', 'genuss'
  ];

  function togglePlant(plant: Plant) {
    const next = new Map(selected);
    if (next.has(plant.id)) {
      next.delete(plant.id);
    } else {
      next.set(plant.id, plant.name);
    }
    selected = next;
  }

  function confirm() {
    const plants = Array.from(selected.entries()).map(([id, name]) => ({ id, name }));
    if (plants.length > 0) {
      onconfirm(plants);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose();
    }
  }

  $effect(() => {
    inputEl?.focus();
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={onclose}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="search-field">
      <input
        bind:this={inputEl}
        bind:value={query}
        type="text"
        placeholder="Pflanze suchen..."
        autocomplete="off"
        autocapitalize="off"
      />
    </div>

    <div class="plant-list">
      {#if query.length > 0}
        {#if results.length > 0}
          <ul class="results-list">
            {#each results as plant}
              {@const isExisting = existingPlantIds.has(plant.id)}
              <li>
                <label class="plant-row" class:existing={isExisting}>
                  <input
                    type="checkbox"
                    checked={selected.has(plant.id)}
                    onchange={() => togglePlant(plant)}
                  />
                  <span class="plant-name">{plant.name}</span>
                  {#if isExisting}
                    <span class="plant-badge">dabei</span>
                  {:else}
                    <span class="plant-category">{CATEGORY_LABELS[plant.category]}</span>
                  {/if}
                </label>
              </li>
            {/each}
          </ul>
        {:else if query.length >= 2}
          <p class="no-results">Keine Pflanze gefunden für "{query}"</p>
        {/if}
      {:else}
        {#each categoryOrder as cat}
          {@const plants = grouped.get(cat)}
          {#if plants}
            <div class="category-group">
              <h4 class="category-header">{CATEGORY_LABELS[cat]}</h4>
              <ul class="results-list">
                {#each plants as plant}
                  {@const isExisting = existingPlantIds.has(plant.id)}
                  <li>
                    <label class="plant-row" class:existing={isExisting}>
                      <input
                        type="checkbox"
                        checked={selected.has(plant.id)}
                        onchange={() => togglePlant(plant)}
                      />
                      <span class="plant-name">{plant.name}</span>
                      {#if isExisting}
                        <span class="plant-badge">dabei</span>
                      {/if}
                    </label>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        {/each}
      {/if}
    </div>

    <div class="actions">
      <button class="btn-cancel" onclick={onclose}>Abbrechen</button>
      <button
        class="btn-primary"
        onclick={confirm}
        disabled={selected.size === 0}
      >
        Speichern ({selected.size})
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 5vh;
    z-index: 200;
  }

  .modal {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem;
    max-width: 400px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
  }

  .search-field input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-field input:focus {
    border-color: var(--color-primary);
  }

  .plant-list {
    flex: 1;
    overflow-y: auto;
    margin: 0.75rem 0;
    min-height: 0;
  }

  .results-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .plant-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.25rem;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    font-size: 0.95rem;
  }

  .plant-row.existing {
    opacity: 0.4;
  }

  .plant-name {
    flex: 1;
    font-weight: 500;
  }

  .plant-category {
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }

  .plant-badge {
    font-size: 0.65rem;
    color: var(--color-primary);
    background: rgba(45, 106, 79, 0.1);
    padding: 0.1rem 0.4rem;
    border-radius: 0.5rem;
  }

  .category-group {
    margin-bottom: 0.5rem;
  }

  .category-header {
    position: sticky;
    top: 0;
    background: var(--color-surface);
    margin: 0;
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid var(--color-primary);
  }

  .no-results {
    color: var(--color-text-muted);
    text-align: center;
    padding: 1rem 0;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-border);
  }

  .btn-cancel {
    flex: 1;
    padding: 0.6rem;
    background: none;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .btn-primary {
    flex: 1;
    padding: 0.6rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
