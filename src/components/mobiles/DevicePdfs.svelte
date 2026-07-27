<script lang="ts">
    import { Device as DeviceModel, type PdfReference } from "../../lib/models";
    import { getRecord, updateRecord, deleteImage } from "../../lib/db";
    import PdfUpload from "../images/PdfUpload.svelte";
    import PdfList from "../images/PdfList.svelte";

    let {
        device,
        recordId = null,
        onUpdated = undefined,
    }: {
        device: DeviceModel;
        recordId?: number | null;
        onUpdated?: (detail: { device: DeviceModel; recordId: number }) => void;
    } = $props();

    let pdfs = $derived(device.pdfs ?? []);

    async function persist(updatedPdfs: PdfReference[]) {
        if (recordId == null) return;

        const updatedDevice = new DeviceModel({
            ...device,
            pdfs: updatedPdfs,
        });

        const record = await getRecord(recordId);
        if (record) {
            record.device = updatedDevice;
            await updateRecord(record);
        }
    }

    function handleUploaded(updatedPdfs: PdfReference[]) {
        if (recordId == null) return;

        const updatedDevice = new DeviceModel({
            ...device,
            pdfs: updatedPdfs,
        });
        onUpdated?.({ device: updatedDevice, recordId });
    }

    async function handleDeletePdf(pdf: PdfReference) {
        if (recordId == null) return;

        await deleteImage(pdf.id);

        const updatedPdfs = pdfs.filter((p) => p.id !== pdf.id);
        const updatedDevice = new DeviceModel({
            ...device,
            pdfs: updatedPdfs,
        });

        const record = await getRecord(recordId);
        if (record) {
            record.device = updatedDevice;
            await updateRecord(record);
        }

        onUpdated?.({ device: updatedDevice, recordId });
    }
</script>

<section class="device-pdfs">
    <h3>PDFs</h3>
    <PdfList {pdfs} onDelete={handleDeletePdf} />
    <PdfUpload {pdfs} {persist} onUploaded={handleUploaded} />
</section>

<style>
    .device-pdfs {
        margin-top: 1rem;
    }

    .device-pdfs h3 {
        margin: 0 0 0.5rem 0;
    }
</style>
