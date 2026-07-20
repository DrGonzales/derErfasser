<script lang="ts">
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
                <button type="button" class="btn btn--secondary" onclick={onCancel} disabled={busy}>
                    {cancelLabel}
                </button>
                <button type="button" class="btn btn--danger" onclick={onConfirm} disabled={busy}>
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .confirm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 400;
        background: rgb(0 0 0 / 45%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .confirm-panel {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
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

    /* Buttons */
    .btn {
        padding: 0.45rem 1rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
    }

    .btn--secondary {
        border: 1px solid var(--color-primary);
        background: transparent;
        color: var(--color-primary);
    }

    .btn--secondary:hover:not(:disabled),
    .btn--secondary:focus-visible:not(:disabled) {
        background: #e4efe6;
        outline: none;
    }

    .btn--danger {
        align-self: flex-start;
        border: 1px solid var(--color-danger);
        background: var(--color-danger);
        color: #fff;
    }

    .btn--danger:hover:not(:disabled),
    .btn--danger:focus-visible:not(:disabled) {
        background: #b91c1c;
        outline: none;
    }

    .btn--danger:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
</style>
