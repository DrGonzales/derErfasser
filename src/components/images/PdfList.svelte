<script lang="ts">
    import { getImage } from "../../lib/db";
    import type { PdfReference } from "../../lib/models";
    import { PdfIcon, TrashIcon } from "../icons";
    import ConfirmDialog from "../shared/ConfirmDialog.svelte";

    let {
        pdfs = [] as PdfReference[],
        onDelete = undefined,
    }: {
        pdfs?: PdfReference[];
        onDelete?: (pdf: PdfReference) => void | Promise<void>;
    } = $props();

    let confirmTarget = $state<PdfReference | null>(null);
    let deleting = $state(false);

    const validPdfs = $derived(
        pdfs.filter(
            (pdf) => typeof pdf?.id === "string" && pdf.id.trim().length > 0,
        ),
    );

    async function openPdf(pdf: PdfReference) {
        const stored = await getImage(pdf.id);
        if (stored?.blob) {
            const url = URL.createObjectURL(stored.blob);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
    }

    function requestDelete(pdf: PdfReference, e: MouseEvent) {
        e.stopPropagation();
        confirmTarget = pdf;
    }

    function cancelDeleteConfirm() {
        confirmTarget = null;
    }

    async function confirmDeleteConfirm() {
        if (!confirmTarget) return;
        deleting = true;
        try {
            await onDelete?.(confirmTarget);
        } finally {
            deleting = false;
            confirmTarget = null;
        }
    }
</script>

{#if validPdfs.length > 0}
    <div class="pdf-list">
        {#each validPdfs as pdf (pdf.id)}
            <div class="pdf-item-wrap">
                <button
                    class="pdf-item"
                    type="button"
                    aria-label={`PDF öffnen: ${pdf.name || "PDF-Dokument"}`}
                    onclick={() => openPdf(pdf)}
                >
                    <span class="pdf-item__icon">
                        <PdfIcon size={28} />
                    </span>
                    <span class="pdf-item__name">{pdf.name || "PDF-Dokument"}</span>
                </button>
                {#if onDelete}
                    <button
                        class="pdf-delete-btn"
                        type="button"
                        aria-label="PDF löschen"
                        title="PDF löschen"
                        onclick={(e) => requestDelete(pdf, e)}
                    >
                        <TrashIcon size={18} />
                    </button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<ConfirmDialog
    open={confirmTarget !== null}
    title="PDF löschen?"
    message="Dieses PDF wird unwiderruflich gelöscht."
    busy={deleting}
    onConfirm={confirmDeleteConfirm}
    onCancel={cancelDeleteConfirm}
/>

<style>
    .pdf-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .pdf-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.6rem 0.75rem;
        border: 1px solid #eee;
        border-radius: 8px;
        background: #f8f8f8;
        cursor: pointer;
        text-align: left;
        font: inherit;
        color: var(--color-text, inherit);
    }

    .pdf-item:hover,
    .pdf-item:focus-visible {
        border-color: #006c5b;
        outline: 2px solid #006c5b;
        outline-offset: 2px;
    }

    .pdf-item-wrap {
        position: relative;
        display: flex;
        align-items: center;
    }

    .pdf-item-wrap .pdf-item {
        flex: 1;
        min-width: 0;
    }

    .pdf-delete-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        margin-left: 0.4rem;
        padding: 0;
        border: none;
        border-radius: 6px;
        background: transparent;
        color: var(--color-danger);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s, color 0.15s;
    }

    .pdf-item-wrap:hover .pdf-delete-btn,
    .pdf-item-wrap:focus-within .pdf-delete-btn,
    .pdf-delete-btn:focus-visible {
        opacity: 1;
    }

    .pdf-delete-btn:hover,
    .pdf-delete-btn:focus-visible {
        background: var(--color-danger-bg);
        outline: none;
    }

    .pdf-item__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: var(--color-primary);
    }

    .pdf-item__name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
