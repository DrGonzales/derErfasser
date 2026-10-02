<script lang="ts">
    import { marked } from "marked";
    import legalRaw from "../../../rechtliche_hinweise_prueftool.md?raw";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";

    let { onClose }: { onClose: () => void } = $props();

    // Die Markdown-Datei beginnt mit einer H1-Überschrift. Der Modal hat
    // bereits einen Titel, deshalb wird die erste Ebene-1-Überschrift
    // entfernt und der Rest als Fließtext (H2/H3, Absätze, Listen, `---`)
    // gerendert.
    const body = legalRaw.replace(/^# .*(\r?\n)+/, "");
    const legalHtml = marked.parse(body, { gfm: true }) as string;
</script>

<Modal title="Impressum & Datenschutz" {onClose} maxWidth="720px">
    <div class="legal-content">
        {@html legalHtml}
    </div>
    {#snippet footer()}
        <Button variant="secondary" onclick={onClose}>Schließen</Button>
    {/snippet}
</Modal>

<style>
    .legal-content {
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.6;
    }

    .legal-content :global(h2) {
        font-size: 1.05rem;
        margin: 1.5rem 0 0.6rem;
        color: var(--color-primary);
        border-top: 1px solid var(--color-border-subtle);
        padding-top: 1rem;
    }

    .legal-content :global(h2:first-child) {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
    }

    .legal-content :global(h3) {
        font-size: 0.9rem;
        margin: 1rem 0 0.35rem;
        color: var(--color-text-strong);
    }

    .legal-content :global(p) {
        margin: 0 0 0.6rem;
    }

    .legal-content :global(ul) {
        margin: 0 0 0.75rem;
        padding-left: 1.25rem;
    }

    .legal-content :global(li) {
        margin-bottom: 0.35rem;
    }

    .legal-content :global(hr) {
        border: 0;
        border-top: 1px solid var(--color-border-subtle);
        margin: 1.5rem 0 0;
    }
</style>