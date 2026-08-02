<script lang="ts">
    import Button from "./Button.svelte";

    let {
        open = false,
        title,
        message,
        confirmLabel = "Ja, löschen",
        cancelLabel = "Nein",
        busy = false,
        onConfirm,
        onCancel,
    }: {
        open?: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        busy?: boolean;
        onConfirm: () => void;
        onCancel: () => void;
    } = $props();
</script>

{#if open}
    <div class="confirm-backdrop" role="dialog" aria-modal="true" aria-label={title}>
        <div class="confirm-panel">
            <svg
                class="confirm-icon"
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
                <path d="M12 3 21 19 3 19Z" />
                <line x1="12" y1="9.5" x2="12" y2="13.5" />
                <line x1="12" y1="16.3" x2="12" y2="16.4" />
            </svg>
            <h3>{title}</h3>
            <p>{message}</p>
            <div class="confirm-actions">
                <Button variant="secondary" onclick={onCancel} disabled={busy}>
                    {cancelLabel}
                </Button>
                <Button variant="danger" onclick={onConfirm} disabled={busy}>
                    {confirmLabel}
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    .confirm-backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-confirm);
        background: var(--modal-backdrop-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .confirm-panel {
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

    .confirm-icon {
        color: var(--color-danger);
    }

    .confirm-panel h3 {
        margin: 0;
        color: var(--color-danger-text);
    }

    .confirm-panel p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .confirm-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
</style>
