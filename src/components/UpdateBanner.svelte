<script lang="ts">
  import { registerSW } from 'virtual:pwa-register';

  let needRefresh = $state(false);

  const updateSW = registerSW({
    onNeedRefresh() {
      needRefresh = true;
    },
  });

  function update() {
    updateSW(true);
  }

  function dismiss() {
    needRefresh = false;
  }
</script>

{#if needRefresh}
  <div class="update-banner">
    <span>Update verfügbar</span>
    <button class="update-btn" onclick={update}>Aktualisieren</button>
    <button class="dismiss-btn" onclick={dismiss}>✕</button>
  </div>
{/if}

<style>
  .update-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    z-index: 200;
  }

  .update-btn {
    background: white;
    color: var(--color-primary);
    border: none;
    border-radius: 0.375rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }

  .dismiss-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 0.75rem;
    opacity: 0.8;
  }
</style>
