<script lang="ts">
    import { untrack } from "svelte";
    import {
        Device as DeviceModel,
        Location,
        ProtectionClass,
        protectionClassLabels,
        protectionClassInfo,
    } from "../../lib/models";
    import { getRecord, updateRecord, addRecord, deleteRecord } from "../../lib/db";
    import {
        locationSuggestions,
        rememberLocation,
    } from "../../lib/stores/locationSuggestions.svelte";
    import Modal from "../shared/Modal.svelte";
    import Button from "../shared/Button.svelte";
    import ConfirmDialog from "../shared/ConfirmDialog.svelte";
    import { cameraSupport } from "../../lib/stores/cameraSupport.svelte";
    import { BarcodeIcon } from "../icons";
    import BarcodeScannerModal from "../shared/BarcodeScannerModal.svelte";

    let {
        device = null,
        location = null,
        recordId = null,
        onSave,
        onCancel,
        onDelete = undefined,
    }: {
        device?: DeviceModel | null;
        location?: Location | null;
        recordId?: number | null;
        onSave: (updated: DeviceModel) => void;
        onCancel: () => void;
        onDelete?: (() => void) | undefined;
    } = $props();

    const isNew = untrack(() => recordId == null);

    // Löschen ist nur für bereits gespeicherte Geräte möglich, die weder
    // Prüfungen noch Bilder noch PDFs besitzen (sonst würden diese
    // verwaisten Daten unwiderruflich zurückbleiben bzw. verloren gehen).
    const canDelete = $derived(
        !isNew &&
            (device?.inspections?.length ?? 0) === 0 &&
            (device?.pictures?.length ?? 0) === 0 &&
            (device?.pdfs?.length ?? 0) === 0,
    );

    const protectionClassOptions = Object.values(ProtectionClass);

    // Initialwerte einmalig aus den Props lesen (untrack = kein reaktives Tracking)
    let type            = $state(untrack(() => device?.type ?? ""));
    let manufacturer    = $state(untrack(() => device?.manufacturer ?? ""));
    let model           = $state(untrack(() => device?.model ?? ""));
    let serialNumber    = $state(untrack(() => device?.serialNumber ?? ""));
    let protectionClass = $state<ProtectionClass | "">(untrack(() => device?.protectionClass ?? ""));
    let ratedVoltage    = $state(untrack(() => device?.ratedVoltage ?? 0));
    let ratedPower      = $state(untrack(() => device?.ratedPower ?? 0));

    // Nachschlagen des Info-Objekts statt nur auf protectionClass (truthy)
    // zu prüfen: So schützt der {#if}-Guard im Template auch gegen alte,
    // ungültige protectionClass-Werte (siehe Device.ts-Konstruktor), bei
    // denen protectionClassInfo[...] sonst undefined liefern und der Zugriff
    // auf .kennzeichen crashen würde.
    const currentProtectionClassInfo = $derived(
        protectionClass ? protectionClassInfo[protectionClass] : undefined,
    );

    // Location
    let locationName = $state(untrack(() => location?.locationName ?? ""));
    let building     = $state(untrack(() => location?.building ?? ""));
    let room         = $state(untrack(() => location?.room ?? ""));

    let saving = $state(false);
    let error  = $state("");
    let showBarcodeScanner = $state(false);
    let confirmDeleteOpen = $state(false);
    let deleting = $state(false);

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        saving = true;
        error = "";

        try {
            const updated = new DeviceModel({
                ...(device ?? {}),
                type,
                manufacturer,
                model,
                serialNumber,
                protectionClass,
                ratedVoltage: Number(ratedVoltage),
                ratedPower:   Number(ratedPower),
            });

            const updatedLocation = new Location({ locationName, building, room });

            if (isNew) {
                await addRecord({ device: updated, location: updatedLocation });
            } else {
                const record = await getRecord(recordId!);
                if (!record) throw new Error("Datensatz nicht gefunden.");
                record.device = updated;
                record.location = updatedLocation;
                await updateRecord(record);
            }

            // Neu eingegebene Standort-Werte sofort für zukünftige
            // Eingaben (Dropdown-Vorschläge) verfügbar machen.
            rememberLocation(updatedLocation);

            onSave(updated);
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        } finally {
            saving = false;
        }
    }

    function handleBarcodeDetected(code: string) {
        serialNumber = code;
    }

    function requestDelete() {
        confirmDeleteOpen = true;
    }

    function cancelDelete() {
        confirmDeleteOpen = false;
    }

    async function confirmDelete() {
        if (recordId == null) return;
        deleting = true;
        error = "";

        try {
            await deleteRecord(recordId);
            confirmDeleteOpen = false;
            onDelete?.();
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        } finally {
            deleting = false;
        }
    }
</script>

<Modal title={isNew ? "Neues Gerät" : "Gerät bearbeiten"} onClose={onCancel} variant="editor" maxWidth="480px">
    <form class="editor-form" onsubmit={handleSubmit}>
            <div class="field-group">
                <label for="ed-type">Typ</label>
                <input id="ed-type" type="text" bind:value={type} />
            </div>
            <div class="field-group">
                <label for="ed-manufacturer">Hersteller</label>
                <input id="ed-manufacturer" type="text" bind:value={manufacturer} />
            </div>
            <div class="field-group">
                <label for="ed-model">Modell</label>
                <input id="ed-model" type="text" bind:value={model} />
            </div>
            <div class="field-group">
                <label for="ed-serial">Seriennummer</label>
                <div class="input-with-scan">
                    <input id="ed-serial" type="text" bind:value={serialNumber} />
                    {#if cameraSupport.hasCamera}
                        <button
                            type="button"
                            class="barcode-scan-btn"
                            aria-label="Barcode scannen"
                            onclick={() => (showBarcodeScanner = true)}
                        >
                            <BarcodeIcon size={20} />
                        </button>
                    {/if}
                </div>
            </div>
            <fieldset class="field-group">
                <legend>Schutzklasse</legend>
                <div class="radio-row">
                    {#each protectionClassOptions as opt (opt)}
                        <label class="radio-option" class:radio-option--selected={protectionClass === opt}>
                            <input
                                class="radio-option__input"
                                type="radio"
                                name="protectionClass"
                                value={opt}
                                checked={protectionClass === opt}
                                onchange={() => (protectionClass = opt)}
                            />
                            <span>{protectionClassLabels[opt]}</span>
                        </label>
                    {/each}
                </div>
                {#if currentProtectionClassInfo}
                    <div class="protection-hint">
                        <dl>
                            <div>
                                <dt>Kennzeichen</dt>
                                <dd>{currentProtectionClassInfo.kennzeichen}</dd>
                            </div>
                            <div>
                                <dt>Erforderliche Prüfungen</dt>
                                <dd>{currentProtectionClassInfo.erforderlichePruefungen}</dd>
                            </div>
                        </dl>
                    </div>
                {/if}
            </fieldset>
            <div class="field-group">
                <label for="ed-voltage">Nennspannung (V)</label>
                <input id="ed-voltage" type="number" bind:value={ratedVoltage} />
            </div>
            <div class="field-group">
                <label for="ed-power">Nennleistung (W)</label>
                <input id="ed-power" type="number" bind:value={ratedPower} />
            </div>

            <hr class="section-divider" />
            <p class="section-label">Standort</p>

            <div class="field-group">
                <label for="ed-location-name">Standortname</label>
                <input
                    id="ed-location-name"
                    type="text"
                    list="ed-location-name-options"
                    autocomplete="off"
                    bind:value={locationName}
                />
                <datalist id="ed-location-name-options">
                    {#each locationSuggestions.locationNames as suggestion (suggestion)}
                        <option value={suggestion}></option>
                    {/each}
                </datalist>
            </div>
            <div class="field-group">
                <label for="ed-building">Gebäude</label>
                <input
                    id="ed-building"
                    type="text"
                    list="ed-building-options"
                    autocomplete="off"
                    bind:value={building}
                />
                <datalist id="ed-building-options">
                    {#each locationSuggestions.buildings as suggestion (suggestion)}
                        <option value={suggestion}></option>
                    {/each}
                </datalist>
            </div>
            <div class="field-group">
                <label for="ed-room">Raum</label>
                <input
                    id="ed-room"
                    type="text"
                    list="ed-room-options"
                    autocomplete="off"
                    bind:value={room}
                />
                <datalist id="ed-room-options">
                    {#each locationSuggestions.rooms as suggestion (suggestion)}
                        <option value={suggestion}></option>
                    {/each}
                </datalist>
            </div>

            {#if error}
                <p class="error" role="alert">{error}</p>
            {/if}

            <div class="editor-actions">
                {#if canDelete}
                    <Button variant="danger" onclick={requestDelete} disabled={saving}>
                        Löschen
                    </Button>
                {/if}
                <div class="editor-actions-right">
                    <Button variant="secondary" onclick={onCancel} disabled={saving}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? "Speichern…" : "Speichern"}
                    </Button>
                </div>
            </div>
    </form>
</Modal>

{#if showBarcodeScanner}
    <BarcodeScannerModal
        onDetected={handleBarcodeDetected}
        onClose={() => (showBarcodeScanner = false)}
    />
{/if}

<ConfirmDialog
    open={confirmDeleteOpen}
    title="Gerät löschen?"
    message="Dieses Gerät wird unwiderruflich gelöscht."
    busy={deleting}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
/>

<style>
    .editor-form {
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

    .field-group label.radio-option {
        color: var(--color-text);
    }

    .field-group input {
        min-height: 44px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 12px;
        font: inherit;
        font-size: 0.95rem;
        color: var(--color-text);
        background: #fbfcfa;
    }

    .field-group input:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    .input-with-scan {
        display: flex;
        gap: 0.5rem;
    }

    .input-with-scan input {
        flex: 1;
        min-width: 0;
    }

    .barcode-scan-btn {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        background: #fbfcfa;
        color: var(--color-text-secondary);
        cursor: pointer;
    }

    .barcode-scan-btn:hover,
    .barcode-scan-btn:focus-visible {
        border-color: var(--color-primary);
        color: var(--color-primary);
        outline: none;
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

    .protection-hint {
        margin-top: 0.25rem;
        padding: 0.75rem 0.9rem;
        border-radius: 8px;
        border-left: 3px solid var(--color-primary);
        background: var(--color-surface-muted);
    }

    .protection-hint dl {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .protection-hint div {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;
    }

    .protection-hint dt {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-muted);
    }

    .protection-hint dd {
        margin: 0;
        font-size: 0.85rem;
        color: var(--color-text);
        line-height: 1.4;
    }

    .error {
        color: #b91c1c;
        font-size: 0.875rem;
        margin: 0;
    }

    .section-divider {
        border: none;
        border-top: 1px solid var(--color-border-subtle);
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
        justify-content: space-between;
        padding-top: 0.5rem;
    }

    .editor-actions-right {
        display: flex;
        gap: 0.75rem;
        margin-left: auto;
    }
</style>
