<script lang="ts">
    import {
        IMPORT_TARGET_FIELDS,
        parseExcelFile,
        mapRowsToDevices,
        importRows,
        type ColumnMapping,
        type MappedDeviceRow,
        type ImportResult,
    } from "../../lib/importService";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";

    let { hasMetaData, onClose, onImported }: { hasMetaData: boolean; onClose: () => void; onImported: () => void } = $props();

    type Step = "upload" | "mapping" | "preview" | "result";

    let step = $state<Step>("upload");

    // Schritt "upload"
    let isParsing = $state(false);
    let parseError = $state("");
    let headers = $state<string[]>([]);
    let rows = $state<unknown[][]>([]);

    // Schritt "mapping"
    // Der <select> wird per bind:value gesteuert, das für <select>-Elemente
    // ausschließlich Strings liefert. Daher wird das Mapping hier als
    // Record<string, string> gehalten ("" = nicht zugeordnet) und erst beim
    // Übergang zur Vorschau in ein ColumnMapping (number | null) umgewandelt.
    let mappingSelection = $state<Record<string, string>>(
        Object.fromEntries(IMPORT_TARGET_FIELDS.map((f) => [f.key, ""]))
    );

    // Schritt "preview"
    let mappedRows = $state<MappedDeviceRow[]>([]);

    // Schritt "result"
    let isImporting = $state(false);
    let importResult = $state<ImportResult | null>(null);

    const mappedFields = $derived(
        IMPORT_TARGET_FIELDS.filter((field) => mappingSelection[field.key] !== "")
    );
    const previewRows = $derived(mappedRows.slice(0, 10));
    const warningsCount = $derived(mappedRows.filter((r) => r.warnings.length > 0).length);

    async function handleFile(file: File) {
        isParsing = true;
        parseError = "";

        try {
            const parsed = await parseExcelFile(file);
            headers = parsed.headers;
            rows = parsed.rows;
            step = "mapping";
        } catch (err) {
            parseError = err instanceof Error ? err.message : String(err);
        } finally {
            isParsing = false;
        }
    }

    function openFilePicker() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".xlsx,.xls,.csv";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
                handleFile(file);
            }
        };
        input.click();
    }

    function goToPreview() {
        const mapping: ColumnMapping = Object.fromEntries(
            IMPORT_TARGET_FIELDS.map((f) => [
                f.key,
                mappingSelection[f.key] === "" ? null : Number(mappingSelection[f.key]),
            ]),
        );
        mappedRows = mapRowsToDevices(rows, mapping);
        step = "preview";
    }

    async function handleImport() {
        isImporting = true;
        try {
            importResult = await importRows(mappedRows);
            step = "result";
        } finally {
            isImporting = false;
        }
    }

    function getCellValue(row: MappedDeviceRow, key: string, target: "device" | "location") {
        const source = target === "device" ? row.device : row.location;
        const value = (source as Record<string, unknown>)[key];
        return value == null ? "" : String(value);
    }

    function finish() {
        onImported();
        onClose();
    }
</script>

<Modal title="Geräte aus Excel importieren" {onClose} variant="editor" maxWidth="640px">
    {#if step === "upload"}
                <div class="step-body">
                    <p class="hint">
                        Wähle eine Excel- oder CSV-Datei aus. Die erste Zeile der Datei wird als
                        Kopfzeile mit Spaltennamen interpretiert.
                    </p>
                    {#if !hasMetaData}
                        <p class="warn-hint">
                            Es sind noch keine Prüfobjekt-Daten hinterlegt. Bitte zunächst unter
                            „Prüfobjekt“ die Angaben ausfüllen und speichern, bevor Geräte
                            importiert werden können.
                        </p>
                    {/if}
                    <Button
                        variant="primary"
                        onclick={openFilePicker}
                        disabled={isParsing || !hasMetaData}
                    >
                        {isParsing ? "Datei wird gelesen…" : "Datei auswählen"}
                    </Button>
                    {#if parseError}
                        <p class="error" role="alert">{parseError}</p>
                    {/if}
                </div>
            {:else if step === "mapping"}
                <div class="step-body">
                    <p class="hint">Ordne jedem Zielfeld die passende Excel-Spalte zu.</p>
                    <div class="mapping-list">
                        {#each IMPORT_TARGET_FIELDS as field (field.key)}
                            <div class="mapping-row">
                                <span class="mapping-label">{field.label}</span>
                                <select
                                    class="mapping-select"
                                    bind:value={mappingSelection[field.key]}
                                >
                                    <option value="">– nicht zuordnen –</option>
                                    {#each headers as header, index (index)}
                                        <option value={index}>{header}</option>
                                    {/each}
                                </select>
                            </div>
                        {/each}
                    </div>
                    <div class="editor-actions">
                        <Button variant="secondary" onclick={() => (step = "upload")}>
                            Zurück
                        </Button>
                        <Button variant="primary" onclick={goToPreview}>
                            Weiter
                        </Button>
                    </div>
                </div>
            {:else if step === "preview"}
                <div class="step-body">
                    <p class="hint">
                        {mappedRows.length} Zeile{mappedRows.length === 1 ? "" : "n"} werden importiert.
                    </p>
                    <div class="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    {#each mappedFields as field (field.key)}
                                        <th>{field.label}</th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody>
                                {#each previewRows as row (row.rowIndex)}
                                    <tr>
                                        {#each mappedFields as field (field.key)}
                                            <td>{getCellValue(row, field.key, field.target)}</td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    {#if mappedRows.length > 10}
                        <p class="hint">... und {mappedRows.length - 10} weitere Zeilen</p>
                    {/if}
                    {#if warningsCount > 0}
                        <p class="warn-hint">
                            ⚠ {warningsCount} Zeile{warningsCount === 1 ? "" : "n"} mit Warnungen (z. B. ungültige Werte).
                        </p>
                    {/if}
                    <div class="editor-actions">
                        <Button variant="secondary" onclick={() => (step = "mapping")} disabled={isImporting}>
                            Zurück
                        </Button>
                        <Button variant="primary" onclick={handleImport} disabled={isImporting}>
                            {isImporting ? "Import läuft…" : "Import starten"}
                        </Button>
                    </div>
                </div>
            {:else if step === "result" && importResult}
                <div class="step-body">
                    <p class="result-success">
                        {importResult.successCount} Gerät{importResult.successCount === 1 ? "" : "e"} erfolgreich importiert.
                    </p>
                    {#if importResult.errorCount > 0 || importResult.errors.length > 0}
                        <p class="warn-hint">
                            {importResult.errorCount} Zeile{importResult.errorCount === 1 ? "" : "n"} mit Problemen:
                        </p>
                        <ul class="error-list">
                            {#each importResult.errors as errorMsg, index (index)}
                                <li>{errorMsg}</li>
                            {/each}
                        </ul>
                    {/if}
                    <div class="editor-actions">
                        <Button variant="primary" onclick={finish}>
                            Fertig
                        </Button>
                    </div>
                </div>
            {/if}
</Modal>

<style>
    .step-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .hint {
        color: var(--color-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    .error {
        color: #b91c1c;
        font-size: 0.875rem;
        margin: 0;
    }

    .mapping-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .mapping-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 0.75rem;
    }

    .mapping-label {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-text-secondary);
    }

    .mapping-select {
        min-height: 40px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 8px;
        font: inherit;
        font-size: 0.9rem;
        color: var(--color-text);
        background: #fbfcfa;
    }

    .mapping-select:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--color-border-input);
        border-radius: 8px;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        font-size: 0.85rem;
    }

    th,
    td {
        padding: 0.5rem 0.75rem;
        text-align: left;
        border-bottom: 1px solid var(--color-border-subtle);
        white-space: nowrap;
    }

    th {
        background: var(--color-surface-muted);
        color: var(--color-text-secondary);
        font-weight: 700;
    }

    tr:last-child td {
        border-bottom: none;
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

    .result-success {
        color: var(--color-text);
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
    }

    .error-list {
        margin: 0;
        max-height: 220px;
        overflow-y: auto;
        padding: 0.75rem 0.75rem 0.75rem 1.5rem;
        border: 1px solid var(--color-border-input);
        border-radius: 8px;
        background: #fdecea;
        color: var(--color-danger-text);
        font-size: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
    }

    .editor-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 0.5rem;
    }
</style>
