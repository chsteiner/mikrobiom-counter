<script lang="ts">
  type View = 'home' | 'list' | 'stats' | 'settings';

  interface Props {
    current: View;
    onnavigate: (view: View) => void;
  }

  let { current, onnavigate }: Props = $props();

  const tabs: { view: View; label: string; icon: string }[] = [
    { view: 'home', label: 'Home', icon: '🏠' },
    { view: 'list', label: 'Liste', icon: '📋' },
    { view: 'stats', label: 'Statistik', icon: '📊' },
    { view: 'settings', label: 'Mehr', icon: '⚙️' },
  ];
</script>

<nav class="navbar">
  {#each tabs as tab}
    <button
      class="nav-tab"
      class:active={current === tab.view}
      onclick={() => onnavigate(tab.view)}
    >
      <span class="nav-icon">{tab.icon}</span>
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
    font-size: 1.25rem;
  }

  .nav-label {
    font-size: 0.65rem;
    font-weight: 500;
  }
</style>
