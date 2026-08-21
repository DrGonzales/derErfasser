<script lang="ts">
    import {
        mergeBackupIntoCurrentData,
        type MergeResult,
    } from "../../lib/backupMergeService";
    import BackButton from "../shared/BackButton.svelte";
    import Button from "../shared/Button.svelte";
    import ProgressBar from "../shared/ProgressBar.svelte";

    let { onBack, onMerged }: { onBack?: () => void; onMerged?: () => void } = $props();

    type MergePhase = "idle" | "running";

    let mergePhase = $state<MergePhase>("idle");
    let extractProgress = $state({ current: 0, total: 0 });
    let error = $state("");
    let result: MergeResult | null = $state(null);

    async function handleMergeFile(file: File) {
        mergePhase = "running";
        extractProgress = { current: 0, total: 0 };
        error = "";
        result = null;

        try {
            const summary = await mergeBackupIntoCurrentData(file, (current, total) => {
                extractProgress = { current, total };
            });
            result = summary;
            onMerged?.();
        } catch (err) {
            error = `Zusammenführen fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            mergePhase = "idle";
        }
    }

    function openFilePicker() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
                handleMergeFile(file);
            }
        };
        input.click();
    }
</script>

<div class="backup-merge">
    <div class="view-header">
        <BackButton onClick={() => onBack?.()} />
        <h2>Backup zusammenführen</h2>
    </div>

    <!-- ── Kachel 1: Zusammenführen starten ─────── -->
    <section class="tile panel-card">
        <p class="description">
            Backup-ZIP-Datei laden, um deren Inhalte dem bestehenden
            Datenbestand hinzuzufügen. Vorhandene Geräte bleiben unverändert;
            neue Geräte sowie noch nicht vorhandene Inspectionen werden
            übernommen.
        </p>
        <p class="warn-hint">
            Voraussetzung: Die Prüfobjekt-Daten im Backup müssen mit den
            vorhandenen übereinstimmen.
        </p>
        <div>
            <Button
                variant="primary"
                onclick={openFilePicker}
                disabled={mergePhase !== "idle"}
            >
                {mergePhase !== "idle" ? "Zusammenführung läuft..." : "Backup zusammenführen"}
            </Button>
        </div>

        {#if mergePhase === "running"}
            {#if extractProgress.total > 0}
                <ProgressBar
                    current={extractProgress.current}
                    total={extractProgress.total}
                    label={"Entpacke Anhang " +
                        extractProgress.current +
                        " von " +
                        extractProgress.total}
                />
            {:else}
                <ProgressBar indeterminate label="Backup wird verarbeitet…" />
            {/if}
        {/if}

        {#if error}
            <p class="error">{error}</p>
        {/if}
    </section>

    <!-- ── Kachel 2: Ergebnis ───────────────────── -->
    {#if result}
        <section class="tile panel-card">
            <h3>Ergebnis</h3>
            <p class="result-summary" role="status">
                {result.insertedDevices.length}
                {result.insertedDevices.length === 1 ? "Gerät" : "Geräte"} eingefügt,
                {result.mergedInspections.length}
                {result.mergedInspections.length === 1 ? "Inspection" : "Inspectionen"} zusammengeführt,
                {result.skippedInspections.length}
                {result.skippedInspections.length === 1 ? "Inspection" : "Inspectionen"} nicht übernommen.
            </p>

            {#if result.insertedDevices.length > 0}
                <div class="report">
                    <p class="report-title">Eingefügte Geräte</p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Typ</th>
                                    <th>Hersteller</th>
                                    <th>Modell</th>
                                    <th>Seriennummer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each result.insertedDevices as device (device.recordId)}
                                    <tr>
                                        <td>{device.type || "–"}</td>
                                        <td>{device.manufacturer || "–"}</td>
                                        <td>{device.model || "–"}</td>
                                        <td>{device.serialNumber || "–"}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}

            {#if result.mergedInspections.length > 0}
                <div class="report">
                    <p class="report-title">Zusammengeführte Inspectionen</p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Typ</th>
                                    <th>Hersteller</th>
                                    <th>Modell</th>
                                    <th>Seriennummer</th>
                                    <th>Prüfungsname</th>
                                    <th>Datum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each result.mergedInspections as entry (entry.recordId + "|" + entry.inspectionName)}
                                    <tr>
                                        <td>{entry.type || "–"}</td>
                                        <td>{entry.manufacturer || "–"}</td>
                                        <td>{entry.model || "–"}</td>
                                        <td>{entry.serialNumber || "–"}</td>
                                        <td>{entry.inspectionName || "–"}</td>
                                        <td>{entry.inspectionDate || "–"}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}

            {#if result.skippedInspections.length > 0}
                <div class="report">
                    <p class="report-title report-title--warn">
                        Nicht übernommene Inspectionen (Prüfungsname bereits vorhanden)
                    </p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Typ</th>
                                    <th>Hersteller</th>
                                    <th>Modell</th>
                                    <th>Seriennummer</th>
                                    <th>Prüfungsname</th>
                                    <th>Datum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each result.skippedInspections as entry (entry.recordId + "|" + entry.inspectionName)}
                                    <tr>
                                        <td>{entry.type || "–"}</td>
                                        <td>{entry.manufacturer || "–"}</td>
                                        <td>{entry.model || "–"}</td>
                                        <td>{entry.serialNumber || "–"}</td>
                                        <td>{entry.inspectionName || "–"}</td>
                                        <td>{entry.inspectionDate || "–"}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </section>
    {/if}
</div>

<style>
    /* Gleicher Rahmen wie die Admin-Seite */
    .backup-merge {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .view-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
    }

    h2 {
        margin-top: 0;
    }

    /* ── Kachel-Look wie im Admin-Bereich ────────── */
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

    .description {
        margin: 0;
        font-size: 0.95rem;
        color: var(--color-text);
    }

    .warn-hint {
        background: #fff8e1;
        border-left: 4px solid #f59e0b;
        padding: 0.6rem 0.85rem;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        font-size: 0.85rem;
        margin: 0;
    }

    .result-summary {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text);
    }

    .report {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
    }

    .report-title {
        margin: 0;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-primary);
    }

    .report-title--warn {
        color: #78350f;
    }

    .table-wrap {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
    }

    th,
    td {
        text-align: left;
        padding: 0.35rem 0.5rem;
        border-bottom: 1px solid var(--color-border-subtle);
        word-break: break-word;
    }

    th {
        color: var(--color-muted);
        font-weight: 700;
    }

    td {
        color: var(--color-text);
    }

    .error {
        margin: 0;
        color: var(--color-danger-text);
        font-size: 0.9rem;
    }
</style>
