<script lang="ts">
    import { untrack } from "svelte";
    import {
        type Device as DeviceModel,
        type Location as LocationModel,
    } from "../../lib/models";
    import DeviceEditor from "./DeviceEditor.svelte";
    import DeviceInfoCard from "./DeviceInfoCard.svelte";
    import DeviceImages from "./DeviceImages.svelte";
    import DevicePdfs from "./DevicePdfs.svelte";
    import InspectionsList from "./InspectionsList.svelte";

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
    let editing = $state(false);

    function handleImageUpdated(detail: {
        device: DeviceModel;
        recordId: number;
    }) {
        device = detail.device;
        onDeviceUpdated?.();
    }

    function handlePdfsUpdated(detail: {
        device: DeviceModel;
        recordId: number;
    }) {
        device = detail.device;
        onDeviceUpdated?.();
    }

    function handleInspectionsUpdated(updated: DeviceModel) {
        device = updated;
        onDeviceUpdated?.();
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
            <button class="back" onclick={() => onBack && onBack()}
                >← Zurück</button
            >
            <button
                class="edit-btn"
                type="button"
                onclick={() => (editing = true)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                </svg>
                Bearbeiten
            </button>
        </div>

        <DeviceInfoCard {device} location={locationProp} />

        <InspectionsList
            {device}
            {recordId}
            onDeviceUpdated={handleInspectionsUpdated}
        />

        <DeviceImages {device} {recordId} onUpdated={handleImageUpdated} />

        <DevicePdfs {device} {recordId} onUpdated={handlePdfsUpdated} />
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
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 14px;
        min-height: 36px;
        background: #fff;
        color: var(--color-text-strong);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .back:hover,
    .back:focus-visible {
        background: var(--color-surface-muted);
        outline: none;
    }

    .edit-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        min-height: 36px;
        padding: 0 14px;
        border: 1px solid var(--color-primary);
        border-radius: 6px;
        background: #fff;
        color: var(--color-primary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
    }

    .edit-btn:hover,
    .edit-btn:focus-visible {
        background: var(--color-surface-muted);
        outline: none;
    }
</style>
