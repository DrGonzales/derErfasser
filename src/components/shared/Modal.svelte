<script lang="ts">
    import type { Snippet } from "svelte";
    import CloseButton from "./CloseButton.svelte";

    let {
        title,
        onClose,
        maxWidth = "600px",
        variant = "modal",
        children,
        footer,
    }: {
        title: string;
        onClose: () => void;
        maxWidth?: string;
        variant?: "modal" | "editor";
        children: Snippet;
        footer?: Snippet;
    } = $props();
</script>

<div
    class="modal-backdrop"
    class:modal-backdrop--editor={variant === "editor"}
    role="dialog"
    aria-modal="true"
    aria-label={title}
>
    <div class="modal-panel" style="max-width: {maxWidth}">
        <div class="modal-header">
            <h2>{title}</h2>
            <CloseButton onClick={onClose} />
        </div>
        <div class="modal-body">
            {@render children()}
        </div>
        {#if footer}
            <div class="modal-footer">
                {@render footer()}
            </div>
        {/if}
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-modal);
        background: var(--modal-backdrop-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .modal-backdrop--editor {
        z-index: var(--z-editor);
    }

    .modal-panel {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--modal-panel-shadow);
        width: 100%;
        max-height: 90dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--color-border-subtle);
        flex-shrink: 0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
    }

    .modal-body {
        padding: 1.25rem;
        overflow-y: auto;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--color-border-subtle);
        flex-shrink: 0;
    }
</style>
