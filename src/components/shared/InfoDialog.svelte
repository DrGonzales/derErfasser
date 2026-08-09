<script lang="ts">
    import Button from "./Button.svelte";

    let {
        open = false,
        title,
        message,
        confirmLabel = "Ok",
        onConfirm,
    }: {
        open?: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        onConfirm: () => void;
    } = $props();
</script>

{#if open}
    <div class="info-backdrop" role="dialog" aria-modal="true" aria-label={title}>
        <div class="info-panel">
            <svg
                class="info-icon"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="8.1" />
                <line x1="12" y1="11.5" x2="12" y2="16" />
            </svg>
            <h3>{title}</h3>
            <p>{message}</p>
            <div class="info-actions">
                <Button variant="primary" onclick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .info-backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-confirm);
        background: var(--modal-backdrop-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .info-panel {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--modal-panel-shadow);
        width: 100%;
        max-width: 420px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        text-align: center;
    }

    .info-icon {
        color: var(--color-primary);
    }

    .info-panel h3 {
        margin: 0;
        color: var(--color-text);
    }

    .info-panel p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .info-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
</style>
