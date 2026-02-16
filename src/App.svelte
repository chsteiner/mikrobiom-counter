<script lang="ts">
  import NavBar from './components/NavBar.svelte';
  import HomeView from './views/HomeView.svelte';
  import ListView from './views/ListView.svelte';
  import StatsView from './views/StatsView.svelte';
  import SettingsView from './views/SettingsView.svelte';
  import { getWeekStore } from './stores/weekStore';

  type View = 'home' | 'list' | 'stats' | 'settings';
  let currentView = $state<View>('home');

  const store = getWeekStore();

  async function handleAdd(plantId: string, plantName: string, source: 'voice' | 'manual') {
    await store.addEntry(plantId, plantName, source);
  }

  async function handleRemove(id: number) {
    await store.removeEntry(id);
  }
</script>

<header class="app-header">
  <h1>Mikrobiom Counter</h1>
</header>

<main>
  {#if currentView === 'home'}
    <HomeView summary={store.summary} onadd={handleAdd} onremove={handleRemove} />
  {:else if currentView === 'list'}
    <ListView weekKey={store.weekKey} entries={store.entries} onremove={handleRemove} />
  {:else if currentView === 'stats'}
    <StatsView />
  {:else if currentView === 'settings'}
    <SettingsView />
  {/if}
</main>

<NavBar current={currentView} onnavigate={(v) => currentView = v} />

<style>
  .app-header {
    background: var(--color-primary);
    color: white;
    padding: 0.75rem 1rem;
    text-align: center;
  }

  .app-header h1 {
    font-size: 1.1rem;
    font-weight: 600;
  }
</style>
