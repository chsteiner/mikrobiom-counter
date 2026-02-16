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
  let color = $derived(
    progress >= 1 ? 'var(--color-success)' :
    progress >= 0.6 ? 'var(--color-primary)' :
    'var(--color-warning)'
  );
</script>

<div class="ring-container">
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
    <span class="ring-label">Pflanzen diese Woche</span>
  </div>
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
  }

  .ring-separator, .ring-goal {
    font-size: 1rem;
    color: var(--color-text-muted);
  }

  .ring-label {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    margin-top: 4px;
  }
</style>
