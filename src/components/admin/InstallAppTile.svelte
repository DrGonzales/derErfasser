<script lang="ts">
    import { pwaInstall, promptInstall } from "../../lib/stores/pwaInstall.svelte";
    import Button from "../shared/Button.svelte";

    type TileState = "installed" | "chromium-prompt" | "safari-guide" | "firefox-guide" | "hidden";

    const state: TileState = $derived.by(() => {
        if (pwaInstall.isInstalled) {
            return "installed";
        }
        if (pwaInstall.browserKind === "chromium" && pwaInstall.canPrompt) {
            return "chromium-prompt";
        }
        if (pwaInstall.browserKind === "safari") {
            return "safari-guide";
        }
        if (pwaInstall.browserKind === "firefox" && pwaInstall.isFirefoxMobile) {
            return "firefox-guide";
        }
        return "hidden";
    });

    async function handleInstall() {
        await promptInstall();
    }
</script>

{#if state !== "hidden"}
    <section class="tile panel-card">
        <h3>App installieren</h3>

        {#if state === "installed"}
            <p class="installed-hint">✓ App ist installiert</p>
        {:else if state === "chromium-prompt"}
            <p class="tile-hint">
                Installiert die App als eigenständiges Programm auf diesem
                Gerät – funktioniert dann auch offline und lässt sich direkt
                vom Startbildschirm öffnen.
            </p>
            <Button variant="primary" onclick={handleInstall}>App installieren</Button>
        {:else if state === "safari-guide"}
            <p class="tile-hint">
                Tippen Sie unten auf das Teilen-Symbol und wählen Sie
                anschließend „Zum Home-Bildschirm“, um die App zu
                installieren.
            </p>
        {:else if state === "firefox-guide"}
            <p class="tile-hint">
                Öffnen Sie das Menü (⋮) und wählen Sie „Installieren“ bzw.
                „Zum Startbildschirm hinzufügen“, um die App zu installieren.
            </p>
        {/if}
    </section>
{/if}

<style>
    .tile {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .tile h3 {
        margin: 0;
        color: var(--color-primary);
    }

    .tile-hint {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--color-muted);
    }

    .installed-hint {
        margin: 0;
        color: var(--color-text);
        font-size: 0.9rem;
    }
</style>
