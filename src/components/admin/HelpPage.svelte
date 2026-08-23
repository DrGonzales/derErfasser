<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteSet } from "svelte/reactivity";
    import { marked } from "marked";
    import helpRaw from "../../../ANWENDERHANDBUCH.md?raw";
    import prozessPruefungSvg from "../../assets/prozess-pruefung.svg?url";
    import BackButton from "../shared/BackButton.svelte";

    let { onBack }: { onBack?: () => void } = $props();

    // Bild-Dateinamen aus dem Markdown auf die per Vite importierten
    // Asset-URLs abbilden (der Renderer bekommt das Markdown als rohen Text,
    // relative Bildpfade können daher nicht direkt aufgelöst werden).
    const imagesByFilename: Record<string, string> = {
        "prozess-pruefung.svg": prozessPruefungSvg,
    };

    // Anker-Format identisch zur Konvention im Handbuch (GitHub-Stil):
    // Kleinbuchstaben, jedes Leerzeichen einzeln -> Bindestrich, Umlaute
    // bleiben erhalten, Sonderzeichen (z. B. Gedankenstriche, Doppelpunkte)
    // werden entfernt.
    function slugify(text: string): string {
        return text
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s_-]/gu, "")
            .replace(/\s/g, "-");
    }

    type TocEntry = { id: string; text: string };
    let toc: TocEntry[] = $state([]);
    let activeId = $state("");
    let tocOpen = $state(false);
    let helpHtml = $state("");

    onMount(() => {
        const entries: TocEntry[] = [];
        const usedIds = new SvelteSet<string>();
        const renderer = new marked.Renderer();

        renderer.heading = function ({ tokens, depth }) {
            const text = this.parser.parseInline(tokens);
            // Rohtext ohne Inline-Markup für Anker und TOC-Beschriftung.
            const plain = tokens.map((t) => t.raw ?? "").join("");
            const baseId = slugify(plain);
            let id = baseId;
            let n = 2;
            while (usedIds.has(id)) {
                id = `${baseId}-${n}`;
                n += 1;
            }
            usedIds.add(id);
            if (depth === 2) {
                entries.push({ id, text: plain });
            }
            return `<h${depth} id="${id}">${text}</h${depth}>`;
        };

        renderer.image = function ({ href, text }) {
            const filename = (href ?? "").split("/").pop() ?? "";
            const resolvedSrc = imagesByFilename[filename];
            if (!resolvedSrc) {
                return "";
            }
            return `<img src="${resolvedSrc}" alt="${text ?? ""}" />`;
        };

        renderer.link = function ({ href, tokens }) {
            const text = this.parser.parseInline(tokens);
            if (href && href.startsWith("#")) {
                return `<a href="${href}" class="toc-link">${text}</a>`;
            }
            return text;
        };

        helpHtml = marked.parse(helpRaw, { renderer, gfm: true }) as string;
        toc = entries;
    });

    function handleContentClick(event: MouseEvent) {
        const target = (event.target as HTMLElement)?.closest?.("a.toc-link");
        if (!target) {
            return;
        }
        const href = target.getAttribute("href");
        if (!href?.startsWith("#")) {
            return;
        }
        event.preventDefault();
        jumpTo(href.slice(1));
    }

    function jumpTo(id: string) {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        activeId = id;
        tocOpen = false;
    }
</script>

<svelte:window onclick={handleContentClick} />

<div class="help-page">
    <div class="view-header">
        <BackButton onClick={() => onBack?.()} />
        <h2>Anleitung</h2>
    </div>

    <button
        type="button"
        class="toc-toggle"
        onclick={() => (tocOpen = !tocOpen)}
        aria-expanded={tocOpen}
    >
        Inhaltsverzeichnis {tocOpen ? "▲" : "▼"}
    </button>

    <div class="help-layout">
        <nav
            class="toc"
            class:toc--open={tocOpen}
            aria-label="Inhaltsverzeichnis"
        >
            <ul>
                {#each toc as entry (entry.id)}
                    <li>
                        <button
                            type="button"
                            class="toc-entry"
                            class:toc-entry--active={activeId === entry.id}
                            onclick={() => jumpTo(entry.id)}
                        >
                            {entry.text}
                        </button>
                    </li>
                {/each}
            </ul>
        </nav>

        <div class="markdown-content">
            {@html helpHtml}
        </div>
    </div>
</div>

<style>
    .help-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .view-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border-subtle);
        padding: 0.75rem 0;
    }

    .view-header h2 {
        margin: 0;
    }

    .toc-toggle {
        display: none;
        width: 100%;
        text-align: left;
        padding: 0.6rem 0.85rem;
        border: 1px solid var(--color-border-subtle);
        border-radius: 8px;
        background: var(--color-surface);
        color: var(--color-text);
        font-weight: 700;
        cursor: pointer;
    }

    .help-layout {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 2rem;
        align-items: start;
    }

    .toc {
        position: sticky;
        top: 4.5rem;
        max-height: calc(100dvh - 5.5rem);
        overflow-y: auto;
        border-right: 1px solid var(--color-border-subtle);
        padding-right: 1rem;
    }

    .toc ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .toc-entry {
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: 0.85rem;
        line-height: 1.3;
    }

    .toc-entry:hover {
        background: var(--color-surface-muted);
        color: var(--color-text);
    }

    .toc-entry--active {
        background: var(--color-surface-muted);
        color: var(--color-primary);
        font-weight: 700;
    }

    .markdown-content {
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.6;
        min-width: 0;
    }

    .markdown-content :global(h1) {
        font-size: 1.3rem;
        margin: 0 0 0.75rem;
        color: var(--color-primary);
    }

    .markdown-content :global(h2) {
        font-size: 1.1rem;
        margin: 2rem 0 0.6rem;
        color: var(--color-primary);
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 1rem;
        scroll-margin-top: 4.5rem;
    }

    .markdown-content :global(h2:first-child) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }

    .markdown-content :global(h3) {
        font-size: 0.95rem;
        margin: 1rem 0 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
        scroll-margin-top: 4.5rem;
    }

    .markdown-content :global(h4),
    .markdown-content :global(h5),
    .markdown-content :global(h6) {
        font-size: 0.9rem;
        margin: 1rem 0 0.4rem;
        color: var(--color-text-strong);
        scroll-margin-top: 4.5rem;
    }

    .markdown-content :global(p) {
        margin: 0 0 0.6rem;
    }

    .markdown-content :global(ul),
    .markdown-content :global(ol) {
        margin: 0 0 0.75rem;
        padding-left: 1.25rem;
    }

    .markdown-content :global(li) {
        margin-bottom: 0.35rem;
    }

    .markdown-content :global(blockquote) {
        margin: 0 0 0.75rem;
        padding: 0.5rem 0.85rem;
        border-left: 4px solid var(--color-warning);
        background: var(--color-warning-bg);
        color: var(--color-warning);
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

    .markdown-content :global(table) {
        border-collapse: collapse;
        width: 100%;
        margin: 0 0 1rem;
        font-size: 0.85rem;
    }

    .markdown-content :global(th),
    .markdown-content :global(td) {
        border: 1px solid var(--color-border-subtle);
        padding: 0.4rem 0.6rem;
        text-align: left;
        vertical-align: top;
    }

    .markdown-content :global(th) {
        background: var(--color-surface-muted);
        font-weight: 700;
    }

    .markdown-content :global(pre) {
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border-subtle);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        overflow-x: auto;
        margin: 0 0 1rem;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    .markdown-content :global(code) {
        font-family:
            ui-monospace,
            "SF Mono",
            Consolas,
            monospace;
    }

    .markdown-content :global(p code),
    .markdown-content :global(li code) {
        background: var(--color-surface-muted);
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
    }

    @media (max-width: 720px) {
        .toc-toggle {
            display: block;
        }

        .help-layout {
            grid-template-columns: 1fr;
            gap: 0;
        }

        .toc {
            position: static;
            max-height: none;
            border-right: none;
            border-bottom: 1px solid var(--color-border-subtle);
            padding-right: 0;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            display: none;
        }

        .toc--open {
            display: block;
        }
    }
</style>
