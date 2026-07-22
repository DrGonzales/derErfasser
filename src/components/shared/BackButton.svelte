<script lang="ts">
    let { onClick, label = "Zurück" }: { onClick: () => void; label?: string } =
        $props();
</script>

<button type="button" class="back-btn" onclick={onClick}>
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="11 18 5 12 11 6" />
    </svg>
    {label}
</button>

<style>
    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        background: #fff;
        color: var(--color-text-strong);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .back-btn:hover,
    .back-btn:focus-visible {
        background: var(--color-surface-muted);
        outline: none;
    }
</style>
