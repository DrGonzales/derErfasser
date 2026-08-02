<script lang="ts">
    import helpRaw from "../../../ANWENDERHANDBUCH.md?raw";
    import prozessPruefungSvg from "../../assets/prozess-pruefung.svg?url";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";

    let { onClose }: { onClose: () => void } = $props();

    // Bild-Dateinamen aus dem Markdown auf die per Vite importierten
    // Asset-URLs abbilden (der einfache Parser kann keine relativen Pfade
    // auflösen, da das Markdown als roher Text eingebunden wird).
    const imagesByFilename: Record<string, string> = {
        "prozess-pruefung.svg": prozessPruefungSvg
    };

    // Sehr einfache Markdown-Darstellung (keine zusätzliche Bibliothek nötig):
    // Überschriften, Aufzählungen, Blockquotes, Fett-Text und Bilder werden
    // in HTML umgewandelt, Verlinkungen zu Abschnitten (#anker) sowie ein
    // Zurück-Link ("← Inhalt") werden übersprungen bzw. entfernt, alles
    // andere bleibt als Absatz stehen.
    function renderMarkdown(markdown: string): string {
        const escapeHtml = (text: string) =>
            text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const applyInline = (text: string) => {
            let result = escapeHtml(text);
            // Links [Text](#anker) -> nur Text anzeigen (Anker werden in
            // diesem einfachen Renderer nicht unterstützt).
            result = result.replace(/\[(.+?)\]\(#.+?\)/g, "$1");
            result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
            return result;
        };

        const lines = markdown.split("\n");
        const html: string[] = [];
        let inList = false;

        const closeList = () => {
            if (inList) {
                html.push("</ul>");
                inList = false;
            }
        };

        let inCodeBlock = false;

        for (const rawLine of lines) {
            const line = rawLine.trimEnd();

            // Fenced Code-Blöcke (z. B. ```mermaid ... ```) werden nicht als
            // Diagramm gerendert, sondern komplett übersprungen: Das jeweilige
            // Diagramm liegt bereits als vorgerendertes Bild vor (siehe
            // imagesByFilename) und wird über eine eigene Bild-Zeile im
            // Markdown eingebunden.
            if (/^```/.test(line.trim())) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) {
                continue;
            }

            if (!line.trim()) {
                closeList();
                continue;
            }

            const imageMatch = /^!\[(.*?)\]\((.+?)\)$/.exec(line.trim());
            if (imageMatch) {
                closeList();
                const [, altText, src] = imageMatch;
                const filename = src.split("/").pop() ?? "";
                const resolvedSrc = imagesByFilename[filename];
                if (resolvedSrc) {
                    html.push(
                        `<img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(altText)}" />`
                    );
                }
                continue;
            }

            const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
            if (headingMatch) {
                closeList();
                const level = headingMatch[1].length;
                html.push(`<h${level}>${applyInline(headingMatch[2])}</h${level}>`);
                continue;
            }

            const quoteMatch = /^>\s*(.*)$/.exec(line.trim());
            if (quoteMatch) {
                closeList();
                html.push(`<blockquote>${applyInline(quoteMatch[1])}</blockquote>`);
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

    const helpHtml = renderMarkdown(helpRaw);
</script>

<Modal title="Anleitung" {onClose}>
    <div class="markdown-content">
        {@html helpHtml}
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

    .markdown-content :global(blockquote) {
        margin: 0 0 0.75rem;
        padding: 0.5rem 0.85rem;
        border-left: 4px solid var(--color-warning, #f59e0b);
        background: #fff8e1;
        color: #78350f;
        border-radius: 0 6px 6px 0;
    }

    .markdown-content :global(img) {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 0 0.75rem;
        border: 1px solid var(--color-border-subtle);
        border-radius: 8px;
    }
</style>
