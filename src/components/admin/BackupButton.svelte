<script lang="ts">
    import { downloadBlob } from "../../lib/download";
    import Button from "../shared/Button.svelte";

    let { onBackupDone }: { onBackupDone?: () => void } = $props();

    let isCreating = $state(false);
    let error = $state("");

    async function handleBackup() {
        isCreating = true;
        error = "";

        try {
            // jszip wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem ZIP-Code aufgebläht wird.
            const { createIndexedDBBackupZip, buildBackupFilename } = await import(
                "../../lib/zipService"
            );
            const { blob, meta } = await createIndexedDBBackupZip();
            const now = Date.now();
            downloadBlob(blob, buildBackupFilename(meta?.pruefObjekt, new Date(now)));
            localStorage.setItem("der-erfasser-last-backup", String(now));
            onBackupDone?.();
        } catch (err) {
            error = `Backup fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isCreating = false;
        }
    }
</script>

<div class="backup-button">
    <Button variant="primary" onclick={handleBackup} disabled={isCreating}>
        {isCreating ? "Backup wird erstellt..." : "Backup herunterladen"}
    </Button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .backup-button {
        display: contents;
    }

    .error {
        margin-top: 0.5rem;
        color: var(--color-danger-text);
        font-size: 0.95rem;
    }
</style>
