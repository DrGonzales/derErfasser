<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import {
        Inspection,
        InspectionResult,
        DeviceStatus,
        Device as DeviceModel,
        inspectionResultLabels,
        deviceStatusLabels,
        protectionClassMeasurementLimits,
        type ImageReference,
        type PdfReference,
    } from "../../lib/models";
    import { getMeta, getRecord, updateRecord, deleteImage } from "../../lib/db";
    import ImageUpload from "../images/ImageUpload.svelte";
    import PictureGrid from "../images/PictureGrid.svelte";
    import PdfUpload from "../images/PdfUpload.svelte";
    import PdfList from "../images/PdfList.svelte";
    import { ResultIcon, StatusIcon } from "../icons";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";

    let {
        device,
        recordId,
        inspection = null,
        readonly = false,
        onSave,
        onCancel,
    }: {
        device: DeviceModel;
        recordId: number;
        inspection?: Inspection | null;
        readonly?: boolean;
        onSave: (updatedDevice: DeviceModel) => void;
        onCancel: () => void;
    } = $props();

    let aktuellePruefung = $state("");

    onMount(async () => {
        const meta = await getMeta();
        aktuellePruefung = meta?.aktuellePruefung?.trim() ?? "";

        if (inspection) {
            protectiveConductorResistanceOhm =
                inspection.protectiveConductorResistanceOhm;
            isolationResistanceMohm = inspection.isolationResistanceMohm;
            substituteLeakageCurrentMa = inspection.substituteLeakageCurrentMa;
            touchCurrentMa = inspection.touchCurrentMa;
            visualTestResult = inspection.visualTestResult;
            measurementTestResult = inspection.measurementTestResult;
            functionTestResult = inspection.functionTestResult;
            overallResult = inspection.overallResult;
            status = inspection.status;
            description = inspection.description;
            pictures = inspection.pictures;
            pdfs = inspection.pdfs ?? [];
        }
    });

    const resultOptions = Object.values(InspectionResult);
    const statusOptions = Object.values(DeviceStatus);

    let visualTestResult = $state<InspectionResult>(InspectionResult.NoResult);
    let measurementTestResult = $state<InspectionResult>(
        InspectionResult.NoResult,
    );
    let functionTestResult = $state<InspectionResult>(
        InspectionResult.NoResult,
    );
    let overallResult = $state<InspectionResult>(InspectionResult.NoResult);
    let status = $state<DeviceStatus>(DeviceStatus.Vorhanden);
    let protectiveConductorResistanceOhm = $state(0);
    let isolationResistanceMohm = $state(0);
    let substituteLeakageCurrentMa = $state(0);
    let touchCurrentMa = $state(0);
    let description = $state("");
    let pictures = $state<ImageReference[]>([]);
    let pdfs = $state<PdfReference[]>([]);

    const measurementLimits = $derived(
        device.protectionClass
            ? protectionClassMeasurementLimits[device.protectionClass]
            : null,
    );

    let saving = $state(false);
    let error = $state("");

    function handlePicturesUploaded(updated: ImageReference[]) {
        pictures = updated;
    }

    function handlePdfsUploaded(updated: PdfReference[]) {
        pdfs = updated;
    }

    async function handleDeletePicture(picture: ImageReference) {
        await deleteImage(picture.id);
        pictures = pictures.filter((p) => p.id !== picture.id);
    }

    async function handleDeletePdf(pdf: PdfReference) {
        await deleteImage(pdf.id);
        pdfs = pdfs.filter((p) => p.id !== pdf.id);
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        saving = true;
        error = "";

        try {
            let updatedDevice: DeviceModel;

            if (inspection) {
                const updatedInspection = new Inspection({
                    protectiveConductorResistanceOhm: Number(
                        protectiveConductorResistanceOhm,
                    ),
                    isolationResistanceMohm: Number(isolationResistanceMohm),
                    substituteLeakageCurrentMa: Number(
                        substituteLeakageCurrentMa,
                    ),
                    touchCurrentMa: Number(touchCurrentMa),
                    visualTestResult,
                    measurementTestResult,
                    functionTestResult,
                    overallResult,
                    status,
                    description,
                    inspectionDate: inspection.inspectionDate,
                    inspectionName: inspection.inspectionName,
                    pictures,
                    pdfs,
                });

                const inspections = [...device.inspections];
                let index = inspections.indexOf(inspection);
                if (index === -1) {
                    index = inspections.findIndex(
                        (insp) =>
                            insp.inspectionDate ===
                                inspection.inspectionDate &&
                            insp.inspectionName === inspection.inspectionName,
                    );
                }
                if (index !== -1) {
                    inspections[index] = updatedInspection;
                }

                updatedDevice = new DeviceModel({
                    ...device,
                    inspections,
                    deactivated: status === DeviceStatus.AusserBetrieb,
                });
            } else {
                const today = new Date().toISOString().split("T")[0];
                const newInspection = new Inspection({
                    protectiveConductorResistanceOhm: Number(
                        protectiveConductorResistanceOhm,
                    ),
                    isolationResistanceMohm: Number(isolationResistanceMohm),
                    substituteLeakageCurrentMa: Number(
                        substituteLeakageCurrentMa,
                    ),
                    touchCurrentMa: Number(touchCurrentMa),
                    visualTestResult,
                    measurementTestResult,
                    functionTestResult,
                    overallResult,
                    status,
                    description,
                    inspectionDate: today,
                    inspectionName: aktuellePruefung,
                    pictures,
                    pdfs,
                });

                updatedDevice = new DeviceModel({
                    ...device,
                    inspections: [...device.inspections, newInspection],
                    deactivated: status === DeviceStatus.AusserBetrieb,
                });
            }

            const record = await getRecord(recordId);
            if (!record) throw new Error("Datensatz nicht gefunden.");
            record.device = updatedDevice;
            await updateRecord(record);

            onSave(updatedDevice);
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        } finally {
            saving = false;
        }
    }
</script>

{#snippet resultIcon(result: string)}
    <ResultIcon result={result as InspectionResult} size={16} />
{/snippet}

{#snippet statusIcon(status: string)}
    <StatusIcon status={status as DeviceStatus} size={16} />
{/snippet}

{#snippet radioGroup(
    legend: string,
    name: string,
    options: string[],
    labels: Record<string, string>,
    selected: string,
    onChange: (value: string) => void,
    disabled: boolean,
    icon: Snippet<[string]>,
)}
    <fieldset class="field-group">
        <legend>{legend}</legend>
        <div class="radio-row">
            {#each options as opt (opt)}
                <label class="radio-option" class:radio-option--selected={selected === opt}>
                    <input
                        class="radio-option__input"
                        type="radio"
                        {name}
                        value={opt}
                        checked={selected === opt}
                        onchange={() => onChange(opt)}
                        {disabled}
                    />
                    <span class="radio-option__icon">{@render icon(opt)}</span>
                    <span>{labels[opt]}</span>
                </label>
            {/each}
        </div>
    </fieldset>
{/snippet}

{#snippet formFields()}
    <div class="form-row panel-card">
        {@render radioGroup(
            "Sichtprüfung",
            "visualTestResult",
            resultOptions,
            inspectionResultLabels,
            visualTestResult,
            (v) => (visualTestResult = v as InspectionResult),
            readonly,
            resultIcon,
        )}
    </div>

    <div class="form-row panel-card">
        {@render radioGroup(
            "Funktionsprüfung",
            "functionTestResult",
            resultOptions,
            inspectionResultLabels,
            functionTestResult,
            (v) => (functionTestResult = v as InspectionResult),
            readonly,
            resultIcon,
        )}
    </div>

    <div class="form-row panel-card">
        {@render radioGroup(
            "Gerätezustand",
            "status",
            statusOptions,
            deviceStatusLabels,
            status,
            (v) => (status = v as DeviceStatus),
            readonly,
            statusIcon,
        )}
    </div>

    <div class="form-row panel-card">
        {@render radioGroup(
            "Messung",
            "measurementTestResult",
            resultOptions,
            inspectionResultLabels,
            measurementTestResult,
            (v) => (measurementTestResult = v as InspectionResult),
            readonly,
            resultIcon,
        )}

        <div class="field-group">
            <label for="ie-protective-conductor">Schutzleiterwiderstand (Ω)</label>
            <input
                id="ie-protective-conductor"
                type="number"
                step="any"
                bind:value={protectiveConductorResistanceOhm}
                disabled={readonly}
            />
            {#if measurementLimits}
                <p class="field-hint">
                    Grenzwert: {measurementLimits.protectiveConductorResistance}
                </p>
            {/if}
        </div>
        <div class="field-group">
            <label for="ie-isolation">Isolationswiderstand (MΩ)</label>
            <input
                id="ie-isolation"
                type="number"
                step="any"
                bind:value={isolationResistanceMohm}
                disabled={readonly}
            />
            {#if measurementLimits}
                <p class="field-hint">
                    Grenzwert: {measurementLimits.isolationResistance}
                </p>
            {/if}
        </div>
        <div class="field-group">
            <label for="ie-substitute-leakage">Ersatzableitstrom (mA)</label>
            <input
                id="ie-substitute-leakage"
                type="number"
                step="any"
                bind:value={substituteLeakageCurrentMa}
                disabled={readonly}
            />
            {#if measurementLimits}
                <p class="field-hint">
                    Grenzwert: {measurementLimits.substituteLeakageCurrent}
                </p>
            {/if}
        </div>
        <div class="field-group">
            <label for="ie-touch-current">Berührungsstrom (mA)</label>
            <input
                id="ie-touch-current"
                type="number"
                step="any"
                bind:value={touchCurrentMa}
                disabled={readonly}
            />
            {#if measurementLimits}
                <p class="field-hint">Grenzwert: {measurementLimits.touchCurrent}</p>
            {/if}
        </div>
    </div>

    <div class="form-row panel-card">
        {@render radioGroup(
            "Gesamtergebnis",
            "overallResult",
            resultOptions,
            inspectionResultLabels,
            overallResult,
            (v) => (overallResult = v as InspectionResult),
            readonly,
            resultIcon,
        )}
    </div>

    <div class="form-row panel-card">
        <div class="field-group">
            <label for="ie-description">Beschreibung</label>
            <textarea
                id="ie-description"
                bind:value={description}
                disabled={readonly}
            ></textarea>
        </div>
    </div>

    <div class="form-row panel-card">
        <p class="section-label">Bilder</p>
        <PictureGrid {pictures} onDelete={readonly ? undefined : handleDeletePicture} />
        {#if !readonly}
            <ImageUpload {pictures} onUploaded={handlePicturesUploaded} />
        {/if}
    </div>

    <div class="form-row panel-card">
        <p class="section-label">PDFs</p>
        <PdfList {pdfs} onDelete={readonly ? undefined : handleDeletePdf} />
        {#if !readonly}
            <PdfUpload {pdfs} onUploaded={handlePdfsUploaded} />
        {/if}
    </div>

    {#if error}
        <p class="error" role="alert">{error}</p>
    {/if}
{/snippet}

<Modal
    title={readonly
        ? "Inspektion Übersicht"
        : inspection
          ? "Inspektion bearbeiten"
          : "Neue Inspektion"}
    onClose={onCancel}
    variant="editor"
    maxWidth="560px"
>
    {#if readonly}
        <div class="editor-form">
            {@render formFields()}

            <div class="editor-actions">
                <Button variant="secondary" onclick={onCancel}>
                    Schließen
                </Button>
            </div>
        </div>
    {:else}
        <form class="editor-form" onsubmit={handleSubmit}>
            {@render formFields()}

            <div class="editor-actions">
                <Button
                    variant="secondary"
                    onclick={onCancel}
                    disabled={saving}
                >
                    Abbrechen
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? "Speichern…" : "Speichern"}
                </Button>
            </div>
        </form>
    {/if}
</Modal>

<style>
    .editor-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .form-row {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem 1.1rem;
    }

    .field-group {
        display: grid;
        gap: 0.35rem;
        border: none;
        padding: 0;
        margin: 0;
    }

    .field-group label,
    .field-group legend {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        padding: 0;
    }

    .field-group label.radio-option {
        color: var(--color-text);
    }

    .field-group input[type="number"],
    .field-group textarea {
        min-height: 44px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 12px;
        font: inherit;
        font-size: 0.95rem;
        color: var(--color-text);
        background: #fbfcfa;
    }

    .field-group textarea {
        min-height: 80px;
        padding: 10px 12px;
        resize: vertical;
    }

    .field-group input:focus,
    .field-group textarea:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    .field-hint {
        margin: 0;
        font-size: 0.78rem;
        font-weight: 400;
        color: var(--color-muted);
    }

    .radio-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .radio-option {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        flex: 1 1 0;
        min-width: 88px;
        min-height: 40px;
        padding: 0 0.9rem;
        border: 1px solid var(--color-border-input);
        border-radius: 8px;
        background: #fff;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text);
        cursor: pointer;
        text-align: center;
        transition:
            background-color 0.15s,
            border-color 0.15s,
            color 0.15s;
    }

    .radio-option__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .radio-option:hover {
        border-color: var(--color-primary);
    }

    .radio-option:focus-within {
        outline: 3px solid var(--focus-ring);
        outline-offset: 2px;
    }

    .field-group label.radio-option--selected {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
    }

    .field-group label.radio-option--selected:hover {
        border-color: var(--color-primary);
    }

    .radio-option__input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
        width: 1px;
        height: 1px;
    }

    .error {
        color: #b91c1c;
        font-size: 0.875rem;
        margin: 0;
    }

    .section-label {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-muted);
    }

    .editor-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-top: 0.5rem;
    }
</style>
