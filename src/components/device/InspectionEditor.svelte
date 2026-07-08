<script lang="ts">
    import { onMount } from "svelte";
    import {
        Inspection,
        InspectionResult,
        DeviceStatus,
        Device as DeviceModel,
        inspectionResultLabels,
        deviceStatusLabels,
        type ImageReference,
    } from "../../lib/models";
    import { getMeta, getRecord, updateRecord } from "../../lib/db";
    import ImageUpload from "../images/ImageUpload.svelte";
    import PictureGrid from "../images/PictureGrid.svelte";

    let {
        device,
        recordId,
        onSave,
        onCancel,
    }: {
        device: DeviceModel;
        recordId: number;
        onSave: (updatedDevice: DeviceModel) => void;
        onCancel: () => void;
    } = $props();

    let aktuellePruefung = $state("");

    onMount(async () => {
        const meta = await getMeta();
        aktuellePruefung = meta?.aktuellePruefung?.trim() ?? "";
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
    let isolationResistanceMohm = $state(0);
    let touchCurrentMa = $state(0);
    let description = $state("");
    let pictures = $state<ImageReference[]>([]);

    let saving = $state(false);
    let error = $state("");

    function handlePicturesUploaded(updated: ImageReference[]) {
        pictures = updated;
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        saving = true;
        error = "";

        try {
            const today = new Date().toISOString().split("T")[0];
            const newInspection = new Inspection({
                isolationResistanceMohm: Number(isolationResistanceMohm),
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
            });

            const updatedDevice = new DeviceModel({
                ...device,
                inspections: [...device.inspections, newInspection],
            });

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

{#snippet radioGroup(
    legend: string,
    name: string,
    options: string[],
    labels: Record<string, string>,
    selected: string,
    onChange: (value: string) => void,
)}
    <fieldset class="field-group">
        <legend>{legend}</legend>
        <div class="radio-row">
            {#each options as opt (opt)}
                <label class="radio-option">
                    <input
                        type="radio"
                        {name}
                        value={opt}
                        checked={selected === opt}
                        onchange={() => onChange(opt)}
                    />
                    {labels[opt]}
                </label>
            {/each}
        </div>
    </fieldset>
{/snippet}

<div
    class="editor-backdrop"
    role="dialog"
    aria-modal="true"
    aria-label="Neue Inspektion"
>
    <div class="editor-panel">
        <div class="editor-header">
            <h2>Neue Inspektion</h2>
            <button
                type="button"
                class="close-btn"
                aria-label="Schließen"
                onclick={onCancel}
            >
                ×
            </button>
        </div>

        <form class="editor-form" onsubmit={handleSubmit}>
            {@render radioGroup(
                "Sichtprüfung",
                "visualTestResult",
                resultOptions,
                inspectionResultLabels,
                visualTestResult,
                (v) => (visualTestResult = v as InspectionResult),
            )}
            {@render radioGroup(
                "Messung",
                "measurementTestResult",
                resultOptions,
                inspectionResultLabels,
                measurementTestResult,
                (v) => (measurementTestResult = v as InspectionResult),
            )}
            {@render radioGroup(
                "Funktionsprüfung",
                "functionTestResult",
                resultOptions,
                inspectionResultLabels,
                functionTestResult,
                (v) => (functionTestResult = v as InspectionResult),
            )}
            {@render radioGroup(
                "Gesamtergebnis",
                "overallResult",
                resultOptions,
                inspectionResultLabels,
                overallResult,
                (v) => (overallResult = v as InspectionResult),
            )}
            {@render radioGroup(
                "Gerätezustand",
                "status",
                statusOptions,
                deviceStatusLabels,
                status,
                (v) => (status = v as DeviceStatus),
            )}

            <div class="field-group">
                <label for="ie-isolation">Isolationswiderstand (MΩ)</label>
                <input
                    id="ie-isolation"
                    type="number"
                    step="any"
                    bind:value={isolationResistanceMohm}
                />
            </div>
            <div class="field-group">
                <label for="ie-touch-current">Berührungsstrom (mA)</label>
                <input
                    id="ie-touch-current"
                    type="number"
                    step="any"
                    bind:value={touchCurrentMa}
                />
            </div>
            <div class="field-group">
                <label for="ie-description">Beschreibung</label>
                <textarea id="ie-description" bind:value={description}
                ></textarea>
            </div>

            <hr class="section-divider" />
            <p class="section-label">Bilder</p>
            <PictureGrid {pictures} />
            <ImageUpload {pictures} onUploaded={handlePicturesUploaded} />

            {#if error}
                <p class="error" role="alert">{error}</p>
            {/if}

            <div class="editor-actions">
                <button
                    type="button"
                    class="btn-cancel"
                    onclick={onCancel}
                    disabled={saving}
                >
                    Abbrechen
                </button>
                <button type="submit" class="btn-save" disabled={saving}>
                    {saving ? "Speichern…" : "Speichern"}
                </button>
            </div>
        </form>
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
        max-width: 560px;
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

    .editor-form {
        padding: 1.25rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
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

    .radio-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
    }

    .radio-option {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--color-text);
        cursor: pointer;
    }

    .error {
        color: #b91c1c;
        font-size: 0.875rem;
        margin: 0;
    }

    .section-divider {
        border: none;
        border-top: 1px solid #e4ece4;
        margin: 0.25rem 0;
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

    .btn-cancel,
    .btn-save {
        min-height: 40px;
        padding: 0 1.25rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .btn-cancel {
        border: 1px solid var(--color-border-input);
        background: #fff;
        color: var(--color-text-strong);
    }

    .btn-cancel:hover:not(:disabled),
    .btn-cancel:focus-visible:not(:disabled) {
        background: var(--color-surface-muted);
        outline: none;
    }

    .btn-save {
        border: 0;
        background: var(--color-primary);
        color: #fff;
    }

    .btn-save:hover:not(:disabled),
    .btn-save:focus-visible:not(:disabled) {
        background: var(--color-primary-hover);
        outline: 2px solid rgb(35 83 71 / 40%);
        outline-offset: 2px;
    }

    .btn-cancel:disabled,
    .btn-save:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
