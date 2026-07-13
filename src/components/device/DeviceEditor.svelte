<script lang="ts">
    import { untrack } from "svelte";
    import { Device as DeviceModel, Location } from "../../lib/models";
    import { getRecord, updateRecord, addRecord } from "../../lib/db";
    import {
        locationSuggestions,
        rememberLocation,
    } from "../../lib/stores/locationSuggestions.svelte";

    let {
        device = null,
        location = null,
        recordId = null,
        onSave,
        onCancel,
    }: {
        device?: DeviceModel | null;
        location?: Location | null;
        recordId?: number | null;
        onSave: (updated: DeviceModel) => void;
        onCancel: () => void;
    } = $props();

    const isNew = untrack(() => recordId == null);

    // Initialwerte einmalig aus den Props lesen (untrack = kein reaktives Tracking)
    let type            = $state(untrack(() => device?.type ?? ""));
    let manufacturer    = $state(untrack(() => device?.manufacturer ?? ""));
    let model           = $state(untrack(() => device?.model ?? ""));
    let serialNumber    = $state(untrack(() => device?.serialNumber ?? ""));
    let protectionClass = $state(untrack(() => device?.protectionClass ?? ""));
    let ratedVoltage    = $state(untrack(() => device?.ratedVoltage ?? 0));
    let ratedPower      = $state(untrack(() => device?.ratedPower ?? 0));

    // Location
    let locationName = $state(untrack(() => location?.locationName ?? ""));
    let building     = $state(untrack(() => location?.building ?? ""));
    let room         = $state(untrack(() => location?.room ?? ""));

    let saving = $state(false);
    let error  = $state("");

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
</script>

<div class="editor-backdrop" role="dialog" aria-modal="true" aria-label={isNew ? "Neues Gerät" : "Gerät bearbeiten"}>
    <div class="editor-panel">
        <div class="editor-header">
            <h2>{isNew ? "Neues Gerät" : "Gerät bearbeiten"}</h2>
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
                <input id="ed-serial" type="text" bind:value={serialNumber} />
            </div>
            <div class="field-group">
                <label for="ed-protection">Schutzklasse</label>
                <input id="ed-protection" type="text" bind:value={protectionClass} />
            </div>
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
                <button type="button" class="btn-cancel" onclick={onCancel} disabled={saving}>
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
        max-width: 480px;
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
    }

    .field-group label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-secondary);
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
