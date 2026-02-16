<script lang="ts">
  import { isSpeechAvailable, isOnline, createRecognition } from '../lib/speechService';
  import { parseTranscript } from '../lib/transcriptParser';
  import { matchPlant, type MatchResult } from '../lib/plantMatcher';

  interface Props {
    onconfirm: (plants: { id: string; name: string }[]) => void;
    onclose: () => void;
  }

  let { onconfirm, onclose }: Props = $props();

  type State = 'ready' | 'listening' | 'results' | 'error';

  let state = $state<State>('ready');
  let interimText = $state('');
  let errorMessage = $state('');
  let matches = $state<MatchResult[]>([]);
  let selected = $state<Set<number>>(new Set());
  let recognition: SpeechRecognition | null = null;

  function startListening() {
    if (!isSpeechAvailable()) {
      errorMessage = 'Spracheingabe wird in diesem Browser nicht unterstützt.';
      state = 'error';
      return;
    }

    if (!isOnline()) {
      errorMessage = 'Keine Internetverbindung. Spracheingabe benötigt Internet.';
      state = 'error';
      return;
    }

    state = 'listening';
    interimText = '';

    recognition = createRecognition({
      onInterim: (text) => {
        interimText = text;
      },
      onFinal: (text) => {
        processTranscript(text);
      },
      onError: (error) => {
        errorMessage = error;
        state = 'error';
      },
      onEnd: () => {
        if (state === 'listening') {
          // Ended without result
          if (!interimText) {
            errorMessage = 'Nichts erkannt. Bitte nochmal versuchen.';
            state = 'error';
          }
        }
      },
    });

    recognition?.start();
  }

  function stopListening() {
    recognition?.stop();
    recognition = null;
  }

  function processTranscript(transcript: string) {
    const tokens = parseTranscript(transcript);
    matches = tokens.map(t => matchPlant(t));

    // Pre-select all matches that found a plant
    selected = new Set(
      matches
        .map((m, i) => (m.plant ? i : -1))
        .filter(i => i >= 0)
    );

    state = 'results';
  }

  function toggleMatch(index: number) {
    const next = new Set(selected);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    selected = next;
  }

  function confirm() {
    const plants = matches
      .filter((_, i) => selected.has(i))
      .filter(m => m.plant)
      .map(m => ({ id: m.plant!.id, name: m.plant!.name }));

    if (plants.length > 0) {
      onconfirm(plants);
    }
  }

  function retry() {
    state = 'ready';
    errorMessage = '';
    matches = [];
    selected = new Set();
  }

  // Auto-start listening when modal opens
  $effect(() => {
    if (state === 'ready') {
      startListening();
    }
    return () => {
      stopListening();
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={onclose}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    {#if state === 'listening'}
      <div class="listening">
        <div class="mic-pulse">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="var(--color-primary)">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>
        <p class="listening-text">Ich höre zu...</p>
        {#if interimText}
          <p class="interim">"{interimText}"</p>
        {/if}
        <button class="btn-secondary" onclick={stopListening}>Stopp</button>
      </div>

    {:else if state === 'results'}
      <div class="results">
        <h3>Erkannte Pflanzen</h3>
        {#if matches.length === 0}
          <p class="no-results">Keine Pflanzen erkannt.</p>
        {:else}
          <ul class="match-list">
            {#each matches as match, i}
              <li class="match-item" class:unmatched={!match.plant}>
                {#if match.plant}
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onchange={() => toggleMatch(i)}
                    />
                    <span class="match-name">{match.plant.name}</span>
                    {#if match.confidence !== 'exact'}
                      <span class="match-source">({match.matchedTerm})</span>
                    {/if}
                  </label>
                {:else}
                  <span class="match-unknown">"{match.matchedTerm}" — nicht erkannt</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
        <div class="actions">
          <button class="btn-secondary" onclick={retry}>Nochmal</button>
          <button
            class="btn-primary"
            onclick={confirm}
            disabled={selected.size === 0}
          >
            Speichern ({selected.size})
          </button>
        </div>
      </div>

    {:else if state === 'error'}
      <div class="error-state">
        <p class="error-msg">{errorMessage}</p>
        <div class="actions">
          <button class="btn-secondary" onclick={onclose}>Abbrechen</button>
          <button class="btn-primary" onclick={retry}>Nochmal versuchen</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
  }

  .modal {
    background: var(--color-surface);
    border-radius: 1rem;
    padding: 1.5rem;
    margin: 1rem;
    max-width: 400px;
    width: 100%;
  }

  .listening {
    text-align: center;
    padding: 1rem 0;
  }

  .mic-pulse {
    display: inline-flex;
    padding: 1rem;
    border-radius: 50%;
    background: rgba(45, 106, 79, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .listening-text {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: var(--color-text);
  }

  .interim {
    margin-top: 0.5rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .results h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .match-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .match-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .match-item label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .match-name {
    font-weight: 500;
  }

  .match-source {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .match-unknown {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .unmatched {
    opacity: 0.6;
  }

  .no-results {
    color: var(--color-text-muted);
    text-align: center;
    padding: 1rem 0;
  }

  .error-state {
    text-align: center;
    padding: 1rem 0;
  }

  .error-msg {
    color: var(--color-danger);
    margin-bottom: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .btn-primary {
    padding: 0.6rem 1.5rem;
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

  .btn-secondary {
    padding: 0.6rem 1.5rem;
    background: none;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }
</style>
