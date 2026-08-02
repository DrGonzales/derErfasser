<script lang="ts">
    import { getMeta } from "../../lib/db";
    import type {
        ReportChartSection,
        ReportDeviceEntry,
    } from "../../lib/reportService";
    import { downloadBlob } from "../../lib/download";
    import Button from "../shared/Button.svelte";

    let {
        chartSections = [],
        passedDevices = [],
        failedDevices = [],
        noResultDevices = [],
        notFoundDevices = [],
        outOfServiceDevices = [],
    }: {
        chartSections?: ReportChartSection[];
        passedDevices?: ReportDeviceEntry[];
        failedDevices?: ReportDeviceEntry[];
        noResultDevices?: ReportDeviceEntry[];
        notFoundDevices?: ReportDeviceEntry[];
        outOfServiceDevices?: ReportDeviceEntry[];
    } = $props();

    let isCreating = $state(false);
    let error = $state("");

    async function handleGenerateReport() {
        isCreating = true;
        error = "";

        try {
            // jsPDF wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem PDF-Code aufgebläht wird.
            const { createReportPdf, buildReportFilename } = await import(
                "../../lib/reportService"
            );
            const meta = await getMeta();
            const blob = await createReportPdf(
                meta,
                chartSections,
                passedDevices,
                failedDevices,
                noResultDevices,
                notFoundDevices,
                outOfServiceDevices,
            );
            downloadBlob(blob, buildReportFilename(meta?.pruefObjekt));
        } catch (err) {
            error = `Bericht fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isCreating = false;
        }
    }
</script>

<div class="report-button">
    <Button variant="primary" onclick={handleGenerateReport} disabled={isCreating}>
        {isCreating ? "Bericht wird erstellt..." : "Bericht erzeugen"}
    </Button>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .report-button {
        display: contents;
    }

    .error {
        margin-top: 0.5rem;
        color: var(--color-danger-text);
        font-size: 0.95rem;
    }
</style>
