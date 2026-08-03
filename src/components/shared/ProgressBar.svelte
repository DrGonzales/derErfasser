<script lang="ts">
    let {
        current = 0,
        total = 0,
        indeterminate = false,
        label = ''
    }: {
        current?: number;
        total?: number;
        indeterminate?: boolean;
        label?: string;
    } = $props();

    let percent = $derived(
        total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0
    );
</script>

<div class="progress-wrapper">
    {#if label}
        <p class="progress-label">{label}</p>
    {/if}

    {#if indeterminate}
        <div class="progress-track">
            <div class="progress-bar progress-bar--indeterminate"></div>
        </div>
    {:else}
        <div
            class="progress-track"
            role="progressbar"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div class="progress-bar" style="width: {percent}%"></div>
        </div>
    {/if}
</div>

<style>
    .progress-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        width: 100%;
    }

    .progress-label {
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        margin: 0;
    }

    .progress-track {
        width: 100%;
        height: 10px;
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: var(--color-primary);
        border-radius: 6px;
        transition: width 0.2s ease;
    }

    .progress-bar--indeterminate {
        width: 40%;
        background: linear-gradient(
            90deg,
            var(--color-primary) 0%,
            var(--color-primary-hover) 50%,
            var(--color-primary) 100%
        );
        animation: progress-indeterminate 1.2s ease-in-out infinite;
    }

    @keyframes progress-indeterminate {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(250%);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .progress-bar--indeterminate {
            animation: none;
            width: 100%;
            transform: none;
            opacity: 0.6;
        }
    }
</style>
