<script lang="ts">
  import { searchPlants } from '../lib/plantMatcher';
  import { CATEGORY_LABELS, type Plant } from '../data/types';

  interface Props {
    onselect: (plantId: string, plantName: string) => void;
    onclose: () => void;
  }

  let { onselect, onclose }: Props = $props();

  let query = $state('');
  let results = $derived(searchPlants(query, 15));
  let inputEl: HTMLInputElement;

  function selectPlant(plant: Plant) {
    onselect(plant.id, plant.name);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onclose();
    }
  }

  // Auto-focus input when modal opens
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

    {#if query.length > 0 && results.length > 0}
      <ul class="results-list">
        {#each results as plant}
          <li>
            <button class="result-item" onclick={() => selectPlant(plant)}>
              <span class="result-name">{plant.name}</span>
              <span class="result-category">{CATEGORY_LABELS[plant.category]}</span>
            </button>
          </li>
        {/each}
      </ul>
    {:else if query.length >= 2 && results.length === 0}
      <p class="no-results">Keine Pflanze gefunden für "{query}"</p>
    {/if}

    <button class="btn-cancel" onclick={onclose}>Abbrechen</button>
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
    padding-top: 10vh;
    z-index: 200;
  }

  .modal {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem;
    max-width: 400px;
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
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

  .results-list {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0 0;
  }

  .result-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.65rem 0.5rem;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    text-align: left;
    font-size: 0.95rem;
  }

  .result-item:active {
    background: var(--color-background);
  }

  .result-name {
    font-weight: 500;
  }

  .result-category {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .no-results {
    color: var(--color-text-muted);
    text-align: center;
    padding: 1rem 0;
    font-size: 0.9rem;
  }

  .btn-cancel {
    display: block;
    width: 100%;
    padding: 0.6rem;
    margin-top: 0.75rem;
    background: none;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }
</style>
