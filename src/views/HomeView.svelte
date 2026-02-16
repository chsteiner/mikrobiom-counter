<script lang="ts">
  import ProgressRing from '../components/ProgressRing.svelte';
  import MicButton from '../components/MicButton.svelte';
  import EntryList from '../components/EntryList.svelte';
  import VoiceModal from '../components/VoiceModal.svelte';
  import ManualInput from '../components/ManualInput.svelte';
  import type { WeekSummary } from '../data/types';

  interface Props {
    summary: WeekSummary;
    onadd: (plantId: string, plantName: string, source: 'voice' | 'manual') => void;
    onremove: (id: number) => void;
  }

  let { summary, onadd, onremove }: Props = $props();
  let showVoice = $state(false);
  let showManual = $state(false);

  function handleVoiceResult(plants: { id: string; name: string }[]) {
    for (const p of plants) {
      onadd(p.id, p.name, 'voice');
    }
    showVoice = false;
  }

  function handleManualResult(plantId: string, plantName: string) {
    onadd(plantId, plantName, 'manual');
    showManual = false;
  }
</script>

<div class="home">
  <ProgressRing count={summary.count} goal={summary.goal} />

  <MicButton onclick={() => showVoice = true} />

  <button class="manual-link" onclick={() => showManual = true}>
    oder manuell eingeben
  </button>

  <EntryList entries={summary.entries} {onremove} />
</div>

{#if showVoice}
  <VoiceModal
    onconfirm={handleVoiceResult}
    onclose={() => showVoice = false}
  />
{/if}

{#if showManual}
  <ManualInput
    onselect={handleManualResult}
    onclose={() => showManual = false}
  />
{/if}

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
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
</style>
