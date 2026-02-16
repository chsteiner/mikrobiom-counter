<script lang="ts">
  interface Props {
    count: number;
    goal: number;
  }

  let { count, goal }: Props = $props();

  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;

  let progress = $derived(Math.min(count / goal, 1));
  let dashoffset = $derived(circumference * (1 - progress));
  let goalReached = $derived(count >= goal);
  let color = $derived(
    goalReached ? 'var(--color-success)' :
    progress >= 0.6 ? 'var(--color-primary)' :
    'var(--color-warning)'
  );

  // One-time celebration when goal is freshly reached
  let celebrated = $state(false);
  let showCelebration = $derived(goalReached && !celebrated);

  $effect(() => {
    if (goalReached && !celebrated) {
      setTimeout(() => celebrated = true, 2000);
    }
    if (!goalReached) {
      celebrated = false;
    }
  });
</script>

<div class="ring-container" class:celebrating={showCelebration} class:goal-reached={goalReached}>
  <svg viewBox="0 0 {(radius + stroke) * 2} {(radius + stroke) * 2}" class="ring-svg">
    <circle
      cx={radius + stroke}
      cy={radius + stroke}
      r={radius}
      fill="none"
      stroke="var(--color-border)"
      stroke-width={stroke}
    />
    <circle
      cx={radius + stroke}
      cy={radius + stroke}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashoffset}
      transform="rotate(-90 {radius + stroke} {radius + stroke})"
      class="progress-circle"
    />
  </svg>
  <div class="ring-text">
    <span class="ring-count">{count}</span>
    <span class="ring-separator">/</span>
    <span class="ring-goal">{goal}</span>
    <span class="ring-label">{goalReached ? 'Ziel erreicht!' : 'Pflanzen diese Woche'}</span>
  </div>
  {#if showCelebration}
    <div class="particles">
      {#each Array(12) as _, i}
        <span class="particle" style="--angle: {i * 30}deg; --delay: {i * 0.05}s"></span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .ring-container {
    position: relative;
    width: 180px;
    height: 180px;
  }

  .ring-svg {
    width: 100%;
    height: 100%;
  }

  .progress-circle {
    transition: stroke-dashoffset 0.4s ease, stroke 0.3s ease;
  }

  .ring-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ring-count {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
    transition: color 0.3s ease;
  }

  .ring-separator, .ring-goal {
    font-size: 1rem;
    color: var(--color-text-muted);
  }

  .ring-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 4px;
    transition: color 0.3s ease;
  }

  .goal-reached .ring-label {
    color: var(--color-success);
    font-weight: 600;
  }

  .goal-reached .ring-count {
    color: var(--color-success);
  }

  /* Celebration bounce + glow */
  .celebrating {
    animation: celebrate-bounce 0.6s ease;
  }

  @keyframes celebrate-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.1); }
    60% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }

  .celebrating .progress-circle {
    filter: drop-shadow(0 0 8px var(--color-success));
  }

  /* Particles */
  .particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
    animation: particle-fly 0.8s ease-out var(--delay) forwards;
    opacity: 0;
  }

  .particle:nth-child(even) {
    background: var(--color-primary);
    width: 4px;
    height: 4px;
  }

  .particle:nth-child(3n) {
    background: var(--color-warning);
    width: 5px;
    height: 5px;
  }

  @keyframes particle-fly {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-100px);
    }
  }
</style>
