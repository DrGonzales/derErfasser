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

    let { onClose, onImported }: { onClose: () => void; onImported: () => void } = $props();

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

<div class="editor-backdrop" role="dialog" aria-modal="true" aria-label="Geräte aus Excel importieren">
    <div class="editor-panel">
        <div class="editor-header">
            <h2>Geräte aus Excel importieren</h2>
            <button type="button" class="close-btn" aria-label="Schließen" onclick={onClose}>
                ×
            </button>
        </div>

        <div class="editor-content">
            {#if step === "upload"}
                <div class="step-body">
                    <p class="hint">
                        Wähle eine Excel- oder CSV-Datei aus. Die erste Zeile der Datei wird als
                        Kopfzeile mit Spaltennamen interpretiert.
                    </p>
                    <button type="button" class="btn btn--primary" onclick={openFilePicker} disabled={isParsing}>
                        {isParsing ? "Datei wird gelesen…" : "Datei auswählen"}
                    </button>
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
                        <button type="button" class="btn btn--secondary" onclick={() => (step = "upload")}>
                            Zurück
                        </button>
                        <button type="button" class="btn btn--primary" onclick={goToPreview}>
                            Weiter
                        </button>
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
                        <button type="button" class="btn btn--secondary" onclick={() => (step = "mapping")} disabled={isImporting}>
                            Zurück
                        </button>
                        <button type="button" class="btn btn--primary" onclick={handleImport} disabled={isImporting}>
                            {isImporting ? "Import läuft…" : "Import starten"}
                        </button>
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
                        <button type="button" class="btn btn--primary" onclick={finish}>
                            Fertig
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .editor-backdrop {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: rgb(0 0 0 / 45%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .editor-panel {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
        width: 100%;
        max-width: 640px;
        max-height: 90dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e4ece4;
        flex-shrink: 0;
    }

    .editor-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
    }

    .close-btn {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--color-muted);
        font-size: 1.6rem;
        line-height: 1;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    .close-btn:hover,
    .close-btn:focus-visible {
        background: var(--color-surface-muted);
        color: var(--color-primary);
        outline: none;
    }

    .editor-content {
        padding: 1.25rem;
        overflow-y: auto;
    }

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
        border-bottom: 1px solid #e4ece4;
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

    .btn {
        min-height: 40px;
        padding: 0 1.25rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .btn--secondary {
        border: 1px solid var(--color-border-input);
        background: #fff;
        color: var(--color-text-strong);
    }

    .btn--secondary:hover:not(:disabled),
    .btn--secondary:focus-visible:not(:disabled) {
        background: var(--color-surface-muted);
        outline: none;
    }

    .btn--primary {
        border: 0;
        background: var(--color-primary);
        color: #fff;
    }

    .btn--primary:hover:not(:disabled),
    .btn--primary:focus-visible:not(:disabled) {
        background: var(--color-primary-hover);
        outline: 2px solid rgb(35 83 71 / 40%);
        outline-offset: 2px;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
