<script lang="ts">
  import ProgressRing from '../components/ProgressRing.svelte';
  import MicButton from '../components/MicButton.svelte';
  import EntryList from '../components/EntryList.svelte';
  import VoiceModal from '../components/VoiceModal.svelte';
  import ManualInput from '../components/ManualInput.svelte';
  import { getSettingsStore } from '../stores/settingsStore.svelte';
  import { calculateStreak, getHistoricalPlantIds, getTotalEntryCount } from '../lib/statsUtils';
  import type { WeekSummary } from '../data/types';

  interface Props {
    summary: WeekSummary;
    onadd: (plantId: string, plantName: string, source: 'voice' | 'manual') => Promise<'added' | 'duplicate'>;
    onremove: (id: number) => void;
  }

  let { summary, onadd, onremove }: Props = $props();
  let showVoice = $state(false);
  let showManual = $state(false);
  let toast = $state<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function showToast(msg: string) {
    toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast = null, 2500);
  }

  const { settings } = getSettingsStore();

  // Historical data for streak + "new plants" detection
  let streak = $state(0);
  let historicalPlantIds = $state(new Set<string>());
  let totalEntries = $state(0);

  // Plants discovered for the first time this week
  let newDiscoveries = $derived.by(() => {
    if (historicalPlantIds.size === 0 && totalEntries === summary.entries.length) {
      // First week ever — all plants are "new", don't highlight
      return [];
    }
    return summary.uniquePlants.filter(id => !historicalPlantIds.has(id));
  });

  let newDiscoverySet = $derived(new Set(newDiscoveries));

  async function loadHistorical() {
    const [s, historical, count] = await Promise.all([
      calculateStreak(settings.streakThreshold),
      getHistoricalPlantIds(summary.weekKey),
      getTotalEntryCount(),
    ]);
    streak = s;
    historicalPlantIds = historical;
    totalEntries = count;
  }

  $effect(() => {
    // Reload when entries change
    summary.entries;
    loadHistorical();
  });

  async function handleVoiceResult(plants: { id: string; name: string }[]) {
    const duplicates: string[] = [];
    for (const p of plants) {
      const result = await onadd(p.id, p.name, 'voice');
      if (result === 'duplicate') duplicates.push(p.name);
    }
    showVoice = false;
    if (duplicates.length > 0) {
      showToast(`${duplicates.join(', ')} — schon dabei`);
    }
  }

  async function handleManualResult(plants: { id: string; name: string }[]) {
    const duplicates: string[] = [];
    for (const p of plants) {
      const result = await onadd(p.id, p.name, 'manual');
      if (result === 'duplicate') duplicates.push(p.name);
    }
    showManual = false;
    if (duplicates.length > 0) {
      showToast(`${duplicates.join(', ')} — schon dabei`);
    }
  }

  let existingPlantIds = $derived(new Set(summary.uniquePlants));

  let isFirstUse = $derived(totalEntries === 0 && summary.entries.length === 0);

  let motivationText = $derived.by(() => {
    const { count, goal } = summary;
    const remaining = goal - count;

    if (count === 0) return null;
    if (count >= goal) return null;
    if (remaining <= 3) return `Nur noch ${remaining}!`;
    if (remaining <= 10) return `Noch ${remaining} bis zum Ziel.`;
    if (count >= 5 && count < 15) return `Guter Start! Schon ${count} verschiedene Pflanzen.`;
    return null;
  });
</script>

<div class="home">
  {#if isFirstUse}
    <!-- Welcome state for first-time users -->
    <div class="welcome">
      <div class="welcome-icon">
        <svg viewBox="0 0 48 48" width="64" height="64">
          <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-primary)" stroke-width="2" opacity="0.3" />
          <path d="M24 8 C24 8 18 16 18 24 C18 28 20.5 32 24 34 C27.5 32 30 28 30 24 C30 16 24 8 24 8Z" fill="var(--color-primary)" opacity="0.8" />
          <path d="M24 34 L24 42" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <h2 class="welcome-title">30 Pflanzen pro Woche</h2>
      <p class="welcome-text">
        Je mehr verschiedene Pflanzen du pro Woche isst, desto besser für dein Darmmikrobiom. Starte jetzt!
      </p>
    </div>
  {:else}
    <ProgressRing count={summary.count} goal={summary.goal} />

    {#if streak >= 2}
      <div class="streak-badge">{streak} Wochen mit {settings.streakThreshold}+ Pflanzen</div>
    {/if}

    {#if motivationText}
      <p class="motivation-text">{motivationText}</p>
    {/if}
  {/if}

  <MicButton onclick={() => showVoice = true} />

  <button class="manual-link" onclick={() => showManual = true}>
    oder manuell eingeben
  </button>

  {#if newDiscoveries.length > 0}
    <div class="discovery-banner">
      <span class="discovery-count">{newDiscoveries.length} neue {newDiscoveries.length === 1 ? 'Pflanze' : 'Pflanzen'} entdeckt!</span>
    </div>
  {/if}

  <EntryList entries={summary.entries} {onremove} newPlantIds={newDiscoverySet} />

  <p class="study-note">
    Basierend auf dem <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5954204/" target="_blank" rel="noopener">American Gut Project</a> (2018): 30+ verschiedene Pflanzen pro Woche führen zu einem signifikant diverseren Darmmikrobiom.
  </p>
</div>

{#if showVoice}
  <VoiceModal
    onconfirm={handleVoiceResult}
    onclose={() => showVoice = false}
  />
{/if}

{#if showManual}
  <ManualInput
    onconfirm={handleManualResult}
    onclose={() => showManual = false}
    {existingPlantIds}
  />
{/if}

{#if toast}
  <div class="toast">{toast}</div>
{/if}

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
  }

  /* Welcome state */
  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 0;
  }

  .welcome-icon {
    opacity: 0.9;
  }

  .welcome-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  .welcome-text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-align: center;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Streak badge */
  .streak-badge {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-muted);
    margin-top: -0.75rem;
  }

  /* Motivation text */
  .motivation-text {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: -0.75rem;
  }

  /* Discovery banner */
  .discovery-banner {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(45, 106, 79, 0.1);
    padding: 0.4rem 0.85rem;
    border-radius: 1rem;
  }

  .discovery-count {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-primary);
  }

  .study-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.5;
    max-width: 300px;
    margin-top: 0.5rem;
  }

  .study-note a {
    color: var(--color-primary);
    text-decoration: underline;
  }

  .manual-link {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  .toast {
    position: fixed;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-text);
    color: var(--color-background);
    padding: 0.5rem 1.25rem;
    border-radius: 1.5rem;
    font-size: 0.8rem;
    z-index: 100;
    animation: toast-in 0.2s ease;
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>
