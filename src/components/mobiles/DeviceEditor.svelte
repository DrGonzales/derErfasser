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
    import InfoDialog from "../shared/InfoDialog.svelte";
    import { cameraSupport } from "../../lib/stores/cameraSupport.svelte";
    import { BarcodeIcon, CloneIcon } from "../icons";
    import BarcodeScannerModal from "../shared/BarcodeScannerModal.svelte";

    let {
        device = null,
        location = null,
        recordId = null,
        onSave,
        onCancel,
        onDelete = undefined,
        onClone = undefined,
    }: {
        device?: DeviceModel | null;
        location?: Location | null;
        recordId?: number | string | null;
        onSave: (updated: DeviceModel) => void;
        onCancel: () => void;
        onDelete?: (() => void) | undefined;
        onClone?: (() => void) | undefined;
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

    // Initialwerte einmalig aus den Props lesen (untrack = kein reaktives
    // Tracking). Werden zusätzlich als Snapshot festgehalten, um weiter
    // unten per Vergleich ungespeicherte Änderungen zu erkennen (hasChanges).
    const initialValues = untrack(() => ({
        type: device?.type ?? "",
        manufacturer: device?.manufacturer ?? "",
        model: device?.model ?? "",
        serialNumber: device?.serialNumber ?? "",
        protectionClass: device?.protectionClass ?? "",
        ratedVoltage: device?.ratedVoltage ?? 0,
        ratedPower: device?.ratedPower ?? 0,
        locationName: location?.locationName ?? "",
        building: location?.building ?? "",
        room: location?.room ?? "",
    }));

    let type            = $state(initialValues.type);
    let manufacturer    = $state(initialValues.manufacturer);
    let model           = $state(initialValues.model);
    let serialNumber    = $state(initialValues.serialNumber);
    let protectionClass = $state<ProtectionClass | "">(initialValues.protectionClass);
    let ratedVoltage    = $state(initialValues.ratedVoltage);
    let ratedPower      = $state(initialValues.ratedPower);

    // Nachschlagen des Info-Objekts statt nur auf protectionClass (truthy)
    // zu prüfen: So schützt der {#if}-Guard im Template auch gegen alte,
    // ungültige protectionClass-Werte (siehe Device.ts-Konstruktor), bei
    // denen protectionClassInfo[...] sonst undefined liefern und der Zugriff
    // auf .kennzeichen crashen würde.
    const currentProtectionClassInfo = $derived(
        protectionClass ? protectionClassInfo[protectionClass] : undefined,
    );

    // Location
    let locationName = $state(initialValues.locationName);
    let building     = $state(initialValues.building);
    let room         = $state(initialValues.room);

    let saving = $state(false);
    let error  = $state("");
    let showBarcodeScanner = $state(false);
    let confirmDeleteOpen = $state(false);
    let deleting = $state(false);
    let cloning = $state(false);
    let cloneInfoOpen = $state(false);

    // Ungespeicherte Änderungen: Vergleich der aktuellen Formularwerte mit
    // dem beim Öffnen des Editors erfassten Snapshot. Zahlenfelder werden
    // numerisch verglichen, damit z.B. eine leere Eingabe ("") nicht
    // fälschlich als Änderung gegenüber 0 gewertet wird.
    const hasChanges = $derived(
        type !== initialValues.type ||
            manufacturer !== initialValues.manufacturer ||
            model !== initialValues.model ||
            serialNumber !== initialValues.serialNumber ||
            protectionClass !== initialValues.protectionClass ||
            Number(ratedVoltage || 0) !== Number(initialValues.ratedVoltage || 0) ||
            Number(ratedPower || 0) !== Number(initialValues.ratedPower || 0) ||
            locationName !== initialValues.locationName ||
            building !== initialValues.building ||
            room !== initialValues.room,
    );

    // Klonen ist nur für bereits gespeicherte Geräte ohne ungespeicherte
    // Änderungen möglich.
    const canClone = $derived(
        !isNew && !hasChanges && !saving && !deleting && !cloning,
    );

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
                // Der Klon-Marker gilt nur bis zur ersten gespeicherten
                // Bearbeitung des geklonten Geräts und wird danach entfernt.
                cloned: false,
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

    async function handleClone() {
        if (!canClone) return;
        cloning = true;
        error = "";

        try {
            // Übernommen werden nur die Gerätestammdaten und die Location.
            // Seriennummer, Ausmusterungs-Status, Bilder, PDFs und
            // Prüfungen werden bewusst NICHT übernommen, da sie sich auf
            // ein konkretes physisches Gerät bzw. dessen Prüfhistorie
            // beziehen.
            const clonedDevice = new DeviceModel({
                type,
                manufacturer,
                model,
                serialNumber: "",
                protectionClass,
                ratedVoltage: Number(ratedVoltage),
                ratedPower: Number(ratedPower),
                inspection: device?.inspection ?? true,
                deactivated: false,
                cloned: true,
            });

            const clonedLocation = new Location({ locationName, building, room });

            await addRecord({
                device: clonedDevice,
                location: clonedLocation,
            });

            // Der Editor bleibt für das Original-Gerät geöffnet; lediglich
            // ein Hinweis-Dialog bestätigt den erfolgreichen Klon-Vorgang.
            cloneInfoOpen = true;
            onClone?.();
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        } finally {
            cloning = false;
        }
    }

    function closeCloneInfo() {
        cloneInfoOpen = false;
    }
</script>

<Modal title={isNew ? "Neues Gerät" : "Gerät bearbeiten"} onClose={onCancel} variant="editor" maxWidth="620px">
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
                    <input
                        id="ed-serial"
                        type="text"
                        bind:value={serialNumber}
                        class:input--warning={serialNumber.trim() === ""}
                    />
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
            <fieldset class="field-group" class:field-group--warning={protectionClass === ""}>
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
                    <Button variant="danger" onclick={requestDelete} disabled={saving || cloning}>
                        Löschen
                    </Button>
                {/if}
                <div class="editor-actions-right">
                    <Button variant="secondary" onclick={onCancel} disabled={saving || cloning}>
                        Abbrechen
                    </Button>
                    {#if !isNew}
                        <Button
                            variant="secondary"
                            class="clone-btn"
                            onclick={handleClone}
                            disabled={!canClone}
                            title={hasChanges
                                ? "Klonen ist erst nach dem Speichern der Änderungen möglich"
                                : "Gerät klonen"}
                        >
                            <CloneIcon size={18} />
                            {cloning ? "Klonen…" : "Klonen"}
                        </Button>
                    {/if}
                    <Button variant="primary" type="submit" disabled={saving || cloning}>
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

<InfoDialog
    open={cloneInfoOpen}
    title="Gerät geklont"
    message="{manufacturer || '–'} - {model || '–'} wurden geklont."
    onConfirm={closeCloneInfo}
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

    .field-group input.input--warning {
        border-color: var(--color-danger);
    }

    fieldset.field-group--warning {
        background: var(--color-danger-bg);
        border-radius: 8px;
        padding: 0.75rem;
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
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: space-between;
        padding-top: 0.5rem;
    }

    .editor-actions-right {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-left: auto;
        justify-content: flex-end;
    }

    :global(.clone-btn) {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        border: 1px solid #93c5fd;
        background: #eff6ff;
        color: #1d4ed8;
    }

    :global(.clone-btn:hover:not(:disabled)),
    :global(.clone-btn:focus-visible:not(:disabled)) {
        background: #dbeafe;
        border-color: #2563eb;
        outline: none;
    }
</style>
