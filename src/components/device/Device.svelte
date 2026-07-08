<script lang="ts">
    import { untrack } from "svelte";
    import { type Device as DeviceModel, type Location as LocationModel } from "../lib/models";
    import ImageUpload from "./ImageUpload.svelte";
    import PictureGrid from "./PictureGrid.svelte";
    import DeviceEditor from "./DeviceEditor.svelte";

    let {
        device: deviceProp = null,
        location: locationProp = null,
        recordId = null,
        onBack = undefined,
        onDeviceUpdated = undefined,
    }: {
        device?: DeviceModel | null;
        location?: LocationModel | null;
        recordId?: number | null;
        onBack?: (() => void) | undefined;
        onDeviceUpdated?: (() => void) | undefined;
    } = $props();

    let device: DeviceModel | null = $state(untrack(() => deviceProp));
    let pictures = $state(untrack(() => deviceProp?.pictures ?? []));
    let editing = $state(false);

    function handleImageUpdated(detail: {
        device: DeviceModel;
        recordId: number;
    }) {
        device = detail.device;
        pictures = detail.device.pictures ?? [];
    }

    function handleSave(updated: DeviceModel) {
        device = updated;
        editing = false;
        onDeviceUpdated?.();
    }
</script>

{#if device}
    <div class="device-view">
        <div class="device-header">
            <button class="back" onclick={() => onBack && onBack()}>← Zurück</button>
            <button class="edit-btn" type="button" onclick={() => (editing = true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Bearbeiten
            </button>
        </div>

        <h2>Gerät: {device.manufacturer} {device.model}</h2>

        <dl>
            <div>
                <dt>Typ</dt>
                <dd>{device.type}</dd>
            </div>
            <div>
                <dt>Hersteller</dt>
                <dd>{device.manufacturer}</dd>
            </div>
            <div>
                <dt>Modell</dt>
                <dd>{device.model}</dd>
            </div>
            <div>
                <dt>Seriennummer</dt>
                <dd>{device.serialNumber}</dd>
            </div>
            <div>
                <dt>Schutzklasse</dt>
                <dd>{device.protectionClass}</dd>
            </div>
            <div>
                <dt>Nennspannung</dt>
                <dd>{device.ratedVoltage}</dd>
            </div>
            <div>
                <dt>Nennleistung</dt>
                <dd>{device.ratedPower}</dd>
            </div>
        </dl>

        <h3>Inspektionen</h3>
        {#if device.inspections && device.inspections.length > 0}
            <table>
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Status</th>
                        <th>Ergebnis</th>
                    </tr>
                </thead>
                <tbody>
                    {#each device.inspections as insp (insp.inspectionDate)}
                        <tr>
                            <td>{insp.inspectionDate}</td>
                            <td>{insp.status}</td>
                            <td>{insp.overallResult}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <div>Keine Inspektionen vorhanden.</div>
        {/if}

        <section class="device-images">
            <h3>Bilder</h3>
            <PictureGrid {pictures} />
        </section>

        <ImageUpload {device} {recordId} onUpdated={handleImageUpdated} />
    </div>

    {#if editing && recordId != null}
        <DeviceEditor
            {device}
            location={locationProp}
            {recordId}
            onSave={handleSave}
            onCancel={() => (editing = false)}
        />
    {/if}
{:else}
    <div>Kein Gerät ausgewählt.</div>
{/if}

<style>
    .device-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.75rem;
    }

    .back {
        border: 1px solid #cbd4ca;
        border-radius: 6px;
        padding: 0 14px;
        min-height: 36px;
        background: #fff;
        color: #40544b;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .back:hover,
    .back:focus-visible {
        background: #f0f7f4;
        outline: none;
    }

    .edit-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid #235347;
        border-radius: 6px;
        background: #fff;
        color: #235347;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .edit-btn:hover,
    .edit-btn:focus-visible {
        background: #f0f7f4;
        outline: none;
    }
    dl div {
        display: flex;
        gap: 0.5rem;
    }
    dt {
        font-weight: 600;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
    }
    th,
    td {
        border: 1px solid #eee;
        padding: 0.35rem;
    }
</style>
