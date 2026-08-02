<script lang="ts">
    import changelogRaw from "../../../CHANGELOG.md?raw";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";

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

<Modal title="Changelog" {onClose}>
    <div class="markdown-content">
        {@html changelogHtml}
    </div>
    {#snippet footer()}
        <Button variant="secondary" onclick={onClose}>Schließen</Button>
    {/snippet}
</Modal>

<style>
    .markdown-content {
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .markdown-content :global(h1) {
        font-size: 1.2rem;
        margin: 0 0 0.75rem;
        color: var(--color-primary);
    }

    .markdown-content :global(h2) {
        font-size: 1.05rem;
        margin: 1.25rem 0 0.5rem;
        color: var(--color-primary);
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 0.75rem;
    }

    .markdown-content :global(h2:first-child) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }

    .markdown-content :global(h3) {
        font-size: 0.9rem;
        margin: 0.75rem 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
    }

    .markdown-content :global(p) {
        margin: 0 0 0.5rem;
    }

    .markdown-content :global(ul) {
        margin: 0 0 0.75rem;
        padding-left: 1.25rem;
    }

    .markdown-content :global(li) {
        margin-bottom: 0.35rem;
    }
</style>
