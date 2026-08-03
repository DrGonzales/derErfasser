<script lang="ts">
    import { restoreDatabaseFromBackup } from "../../lib/db";
    import Button from "../shared/Button.svelte";
    import ProgressBar from "../shared/ProgressBar.svelte";

    let { onRestored }: { onRestored?: () => void } = $props();

    type RestorePhase = "idle" | "extracting" | "saving";

    let restorePhase = $state<RestorePhase>("idle");
    let extractProgress = $state({ current: 0, total: 0 });
    let error = $state("");

    async function handleRestoreFile(file: File) {
        restorePhase = "extracting";
        extractProgress = { current: 0, total: 0 };
        error = "";

        try {
            // jszip wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem ZIP-Code aufgebläht wird.
            const { loadIndexedDBBackupZip } = await import(
                "../../lib/zipService"
            );
            const backup = await loadIndexedDBBackupZip(file, (current, total) => {
                extractProgress = { current, total };
            });

            // Phase 2: Die eigentliche DB-Schreibung ist eine einzelne atomare
            // IndexedDB-Transaktion und lässt sich daher nicht granular anzeigen.
            restorePhase = "saving";
            await restoreDatabaseFromBackup(backup.records, backup.images, backup.meta);
            onRestored?.();
        } catch (err) {
            error = `Restore fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            restorePhase = "idle";
        }
    }

    function openFilePicker() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
                handleRestoreFile(file);
            }
        };
        input.click();
    }
</script>

<div class="restore-button">
    <Button
        variant="primary"
        onclick={openFilePicker}
        disabled={restorePhase !== "idle"}
    >
        {restorePhase !== "idle" ? "Restore läuft..." : "Backup wiederherstellen"}
    </Button>

    {#if restorePhase === "extracting"}
        {#if extractProgress.total > 0}
            <ProgressBar
                current={extractProgress.current}
                total={extractProgress.total}
                label={"Entpacke Bild " +
                    extractProgress.current +
                    " von " +
                    extractProgress.total}
            />
        {:else}
            <ProgressBar indeterminate label="Backup wird entpackt…" />
        {/if}
    {:else if restorePhase === "saving"}
        <ProgressBar indeterminate label="Datenbank wird geschrieben…" />
    {/if}

    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .restore-button {
        margin-top: 1rem;
    }

    .error {
        margin-top: 0.5rem;
        color: var(--color-danger-text);
        font-size: 0.95rem;
    }
</style>
