<script lang="ts">
    import { Device as DeviceModel, type ImageReference } from "../../lib/models";
    import { getRecord, updateRecord } from "../../lib/db";
    import ImageUpload from "../images/ImageUpload.svelte";
    import PictureGrid from "../images/PictureGrid.svelte";

    let {
        device,
        recordId = null,
        onUpdated = undefined,
    }: {
        device: DeviceModel;
        recordId?: number | null;
        onUpdated?: (detail: { device: DeviceModel; recordId: number }) => void;
    } = $props();

    let pictures = $derived(device.pictures ?? []);

    async function persist(updatedPictures: ImageReference[]) {
        if (recordId == null) return;

        const updatedDevice = new DeviceModel({
            ...device,
            pictures: updatedPictures,
        });

        const record = await getRecord(recordId);
        if (record) {
            record.device = updatedDevice;
            await updateRecord(record);
        }
    }

    function handleUploaded(updatedPictures: ImageReference[]) {
        if (recordId == null) return;

        const updatedDevice = new DeviceModel({
            ...device,
            pictures: updatedPictures,
        });
        onUpdated?.({ device: updatedDevice, recordId });
    }
</script>

<section class="device-images">
    <h3>Bilder</h3>
    <PictureGrid {pictures} />
    <ImageUpload {pictures} {persist} onUploaded={handleUploaded} />
</section>

<style>
    .device-images {
        margin-top: 1rem;
    }

    .device-images h3 {
        margin: 0 0 0.5rem 0;
    }
</style>
