<script lang="ts">
    import { restoreDatabaseFromBackup } from "../../lib/db";
    import Button from "../shared/Button.svelte";

    let { onRestored }: { onRestored?: () => void } = $props();

    let isRestoring = $state(false);
    let error = $state("");

    async function handleRestoreFile(file: File) {
        isRestoring = true;
        error = "";

        try {
            // jszip wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem ZIP-Code aufgebläht wird.
            const { loadIndexedDBBackupZip } = await import(
                "../../lib/zipService"
            );
            const backup = await loadIndexedDBBackupZip(file);
            await restoreDatabaseFromBackup(backup.records, backup.images, backup.meta);
            onRestored?.();
        } catch (err) {
            error = `Restore fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isRestoring = false;
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
    <Button variant="primary" onclick={openFilePicker} disabled={isRestoring}>
        {isRestoring ? "Restore läuft..." : "Backup wiederherstellen"}
    </Button>
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
