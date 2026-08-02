<script lang="ts">
    let {
        onClick,
        label = "Schließen",
    }: {
        onClick: () => void;
        label?: string;
    } = $props();
</script>

<button type="button" class="close-btn" aria-label={label} onclick={onClick}>×</button>

<style>
    .close-btn {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--color-muted);
        font-size: 1.6rem;
        line-height: 1;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    .close-btn:hover,
    .close-btn:focus-visible {
        background: var(--color-surface-muted);
        color: var(--color-primary);
        outline: none;
    }
</style>
