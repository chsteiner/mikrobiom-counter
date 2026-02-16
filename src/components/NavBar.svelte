<script lang="ts">
  type View = 'home' | 'list' | 'stats' | 'settings';

  interface Props {
    current: View;
    onnavigate: (view: View) => void;
  }

  let { current, onnavigate }: Props = $props();

  const tabs: { view: View; label: string }[] = [
    { view: 'home', label: 'Home' },
    { view: 'list', label: 'Liste' },
    { view: 'stats', label: 'Statistik' },
    { view: 'settings', label: 'Mehr' },
  ];
</script>

<nav class="navbar">
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={current === tab.view}
      onclick={() => onnavigate(tab.view)}
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        {#if tab.view === 'home'}
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <path d="M9 21V14h6v7" />
        {:else if tab.view === 'list'}
          <path d="M9 5h11M9 12h11M9 19h11" />
          <circle cx="4.5" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="4.5" cy="19" r="1" fill="currentColor" stroke="none" />
        {:else if tab.view === 'stats'}
          <rect x="3" y="12" width="4" height="9" rx="0.5" />
          <rect x="10" y="7" width="4" height="14" rx="0.5" />
          <rect x="17" y="3" width="4" height="18" rx="0.5" />
        {:else if tab.view === 'settings'}
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        {/if}
      </svg>
      <span class="nav-label">{tab.label}</span>
    </button>
  {/each}
</nav>

<style>
  .navbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 100;
  }

  .nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-tab.active {
    color: var(--color-primary);
  }

  .nav-icon {
    width: 22px;
    height: 22px;
  }

  .nav-label {
    font-size: 0.65rem;
    font-weight: 500;
  }
</style>
