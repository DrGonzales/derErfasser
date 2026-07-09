<script lang="ts">
    import {
        buildBackupFilename,
        createIndexedDBBackupZip,
        downloadBlob,
    } from "../../lib/zipService";

    let { onBackupDone }: { onBackupDone?: () => void } = $props();

    let isCreating = $state(false);
    let error = $state("");

    async function handleBackup() {
        isCreating = true;
        error = "";

        try {
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
    <button type="button" onclick={handleBackup} disabled={isCreating}>
        {isCreating ? "Backup wird erstellt..." : "Backup herunterladen"}
    </button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .backup-button {
        display: contents;
    }

    button {
        padding: 0.4rem 0.9rem;
        border: 1px solid var(--color-primary);
        background: var(--color-primary);
        color: #fff;
        border-radius: 6px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s;
        white-space: nowrap;
    }

    button:hover,
    button:focus-visible {
        background: var(--color-primary-hover);
        outline: none;
    }

    button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .error {
        margin-top: 0.5rem;
        color: var(--color-danger-text);
        font-size: 0.95rem;
    }
</style>
