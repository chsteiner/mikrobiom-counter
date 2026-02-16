<script lang="ts">
  import { getSettingsStore } from '../stores/settingsStore.svelte';
  import { exportJSON, exportCSV, importJSON, clearAllData } from '../lib/exportService';
  import { getWeekStore } from '../stores/weekStore.svelte';

  const store = getSettingsStore();
  const weekStore = getWeekStore();

  let importMessage = $state('');
  let showDeleteConfirm = $state(false);

  async function handleImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const { added, skipped } = await importJSON(file);
      const parts: string[] = [];
      if (added > 0) parts.push(`${added} Einträge importiert`);
      if (skipped > 0) parts.push(`${skipped} Duplikate übersprungen`);
      importMessage = parts.join(', ') + '.';
      if (added === 0 && skipped > 0) importMessage = `Alle ${skipped} Einträge waren bereits vorhanden.`;
      await weekStore.refresh();
    } catch (err) {
      importMessage = `Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`;
    }
    input.value = '';
  }

  async function handleDelete() {
    await clearAllData();
    showDeleteConfirm = false;
    importMessage = 'Alle Daten gelöscht.';
    await weekStore.refresh();
  }
</script>

<div class="settings-view">
  <h2>Einstellungen</h2>

  <section class="setting-group">
    <label class="setting-row">
      <span class="setting-label">Wochenziel</span>
      <input
        type="number"
        min="1"
        max="100"
        value={store.settings.weeklyGoal}
        onchange={(e) => store.update({ weeklyGoal: parseInt((e.target as HTMLInputElement).value) || 30 })}
      />
    </label>

    <label class="setting-row">
      <span class="setting-label">Serien-Schwelle</span>
      <input
        type="number"
        min="1"
        max="100"
        value={store.settings.streakThreshold}
        onchange={(e) => store.update({ streakThreshold: parseInt((e.target as HTMLInputElement).value) || 20 })}
      />
      <span class="setting-hint">Min. Pflanzen für Serie</span>
    </label>
  </section>

  <section class="setting-group">
    <h3>Daten</h3>
    <div class="button-group">
      <button class="btn" onclick={exportJSON}>JSON exportieren</button>
      <button class="btn" onclick={exportCSV}>CSV exportieren</button>
    </div>

    <label class="btn btn-file">
      JSON importieren
      <input type="file" accept=".json" onchange={handleImport} hidden />
    </label>

    {#if !showDeleteConfirm}
      <button class="btn btn-danger" onclick={() => showDeleteConfirm = true}>
        Alle Daten löschen
      </button>
    {:else}
      <div class="confirm-delete">
        <p>Wirklich alle Daten löschen?</p>
        <div class="button-group">
          <button class="btn" onclick={() => showDeleteConfirm = false}>Abbrechen</button>
          <button class="btn btn-danger" onclick={handleDelete}>Ja, löschen</button>
        </div>
      </div>
    {/if}

    {#if importMessage}
      <p class="import-msg">{importMessage}</p>
    {/if}
  </section>

  <section class="setting-group info">
    <p>Mikrobiom Counter v1.0.0</p>
    <p>Daten werden lokal auf deinem Gerät gespeichert.</p>
  </section>
</div>

<style>
  .settings-view {
    padding: 1.5rem 1rem;
  }

  h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.75rem;
  }

  .setting-group {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .setting-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .setting-label {
    flex: 1;
    font-size: 0.9rem;
  }

  .setting-hint {
    width: 100%;
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }

  .setting-row input[type="number"] {
    width: 60px;
    padding: 0.4rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    font-size: 0.9rem;
    text-align: center;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .btn {
    flex: 1;
    padding: 0.6rem 1rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: center;
  }

  .btn-file {
    display: block;
    margin-bottom: 0.5rem;
    cursor: pointer;
  }

  .btn-danger {
    color: var(--color-danger);
    border-color: var(--color-danger);
  }

  .confirm-delete {
    padding: 0.75rem;
    background: rgba(231, 111, 81, 0.05);
    border-radius: 0.5rem;
    text-align: center;
  }

  .confirm-delete p {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .import-msg {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  .info {
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .info p {
    margin-bottom: 0.25rem;
  }
</style>
