<script lang="ts">
    import { createIndexedDBBackupZip, downloadBlob } from "../lib/zipService";

    let isCreating = false;
    let error = "";

    async function handleBackup() {
        isCreating = true;
        error = "";

        try {
            const blob = await createIndexedDBBackupZip();
            downloadBlob(
                blob,
                `der-erfasser-backup-${new Date().toISOString()}.zip`,
            );
        } catch (err) {
            error = `Backup fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isCreating = false;
        }
    }
</script>

<div class="backup-button">
    <button type="button" on:click={handleBackup} disabled={isCreating}>
        {isCreating ? "Backup wird erstellt..." : "Backup herunterladen"}
    </button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .backup-button {
        margin-top: 1rem;
    }

    button {
        padding: 0.55rem 1rem;
        border: 1px solid #006c5b;
        background: #006c5b;
        color: #fff;
        border-radius: 6px;
        cursor: pointer;
    }

    button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .error {
        margin-top: 0.5rem;
        color: #a00;
        font-size: 0.95rem;
    }
</style>
