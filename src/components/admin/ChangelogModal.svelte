<script lang="ts">
    import changelogRaw from "../../../CHANGELOG.md?raw";

    let { onClose }: { onClose: () => void } = $props();

    // Sehr einfache Markdown-Darstellung (keine zusätzliche Bibliothek nötig):
    // Überschriften, Aufzählungen und Fett-Text werden in HTML umgewandelt,
    // alles andere bleibt als Absatz stehen.
    function renderMarkdown(markdown: string): string {
        const escapeHtml = (text: string) =>
            text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const applyInline = (text: string) =>
            escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

        const lines = markdown.split("\n");
        const html: string[] = [];
        let inList = false;

        const closeList = () => {
            if (inList) {
                html.push("</ul>");
                inList = false;
            }
        };

        for (const rawLine of lines) {
            const line = rawLine.trimEnd();

            if (!line.trim()) {
                closeList();
                continue;
            }

            const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
            if (headingMatch) {
                closeList();
                const level = headingMatch[1].length;
                html.push(`<h${level}>${applyInline(headingMatch[2])}</h${level}>`);
                continue;
            }

            const listMatch = /^[-*]\s+(.*)$/.exec(line.trim());
            if (listMatch) {
                if (!inList) {
                    html.push("<ul>");
                    inList = true;
                }
                html.push(`<li>${applyInline(listMatch[1])}</li>`);
                continue;
            }

            closeList();
            html.push(`<p>${applyInline(line.trim())}</p>`);
        }

        closeList();
        return html.join("\n");
    }

    const changelogHtml = renderMarkdown(changelogRaw);
</script>

<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Changelog">
    <div class="modal-panel">
        <div class="modal-header">
            <h2>Changelog</h2>
            <button
                type="button"
                class="close-btn"
                aria-label="Schließen"
                onclick={onClose}
            >
                ×
            </button>
        </div>

        <div class="modal-body">
            {@html changelogHtml}
        </div>

        <div class="modal-actions">
            <button type="button" class="btn-close" onclick={onClose}>
                Schließen
            </button>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 300;
        background: rgb(0 0 0 / 45%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .modal-panel {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
        width: 100%;
        max-width: 600px;
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
        border-bottom: 1px solid #e4ece4;
        flex-shrink: 0;
    }

    .modal-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
    }

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

    .modal-body {
        padding: 1.25rem;
        overflow-y: auto;
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .modal-body :global(h1) {
        font-size: 1.2rem;
        margin: 0 0 0.75rem;
        color: var(--color-primary);
    }

    .modal-body :global(h2) {
        font-size: 1.05rem;
        margin: 1.25rem 0 0.5rem;
        color: var(--color-primary);
        border-top: 1px solid #e4ece4;
        padding-top: 0.75rem;
    }

    .modal-body :global(h2:first-child) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }

    .modal-body :global(h3) {
        font-size: 0.9rem;
        margin: 0.75rem 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
    }

    .modal-body :global(p) {
        margin: 0 0 0.5rem;
    }

    .modal-body :global(ul) {
        margin: 0 0 0.75rem;
        padding-left: 1.25rem;
    }

    .modal-body :global(li) {
        margin-bottom: 0.35rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 1.25rem;
        border-top: 1px solid #e4ece4;
        flex-shrink: 0;
    }

    .btn-close {
        min-height: 40px;
        padding: 0 1.25rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid var(--color-border-input);
        background: #fff;
        color: var(--color-text-strong);
    }

    .btn-close:hover,
    .btn-close:focus-visible {
        background: var(--color-surface-muted);
        outline: none;
    }
</style>
