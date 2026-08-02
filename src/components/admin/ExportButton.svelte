<script lang="ts">
    import { downloadBlob } from "../../lib/download";
    import { getRecords, getMeta } from "../../lib/db";

    let isExporting = $state(false);
    let error = $state("");

    async function handleExport() {
        isExporting = true;
        error = "";

        try {
            // xlsx wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem Excel-Code aufgebläht wird.
            const { createExportWorkbook, buildExportFilename } = await import(
                "../../lib/exportService"
            );
            const [records, meta] = await Promise.all([getRecords(), getMeta()]);
            const blob = await createExportWorkbook(records, meta?.aktuellePruefung ?? "");
            downloadBlob(blob, buildExportFilename(meta?.pruefObjekt, new Date()));
        } catch (err) {
            error = `Export fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isExporting = false;
        }
    }
</script>

<div class="export-button">
    <button type="button" class="btn btn--secondary" onclick={handleExport} disabled={isExporting}>
        {isExporting ? "Export wird erstellt..." : "Excel-Datei exportieren"}
    </button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .export-button {
        display: contents;
    }

    .error {
        margin-top: 0.5rem;
        color: var(--color-danger-text);
        font-size: 0.95rem;
    }
</style>
