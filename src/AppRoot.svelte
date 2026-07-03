<script lang="ts">
    import Upload from "./components/Upload.svelte";
    import EntriesList from "./components/EntriesList.svelte";
    import Device from "./components/Device.svelte";
    import { uploadCounter } from "./lib/stores/uploadStore";

    let message = "";
    let selectedRecord: { device: any; recordId: number } | null = null;

    // show a message when an upload happens (uploadCounter increments)
    $: if ($uploadCounter) {
        message = "Upload abgeschlossen. Die App hat Daten in IndexedDB.";
    }

    function openDevice(record: { device: any; recordId: number }) {
        selectedRecord = record;
    }

    function closeDevice() {
        selectedRecord = null;
    }
</script>

<main>
    <h1>derErfasser</h1>
    <Upload />

    {#if selectedRecord}
        <Device
            device={selectedRecord.device}
            recordId={selectedRecord.recordId}
            onBack={closeDevice}
        />
    {:else}
        <EntriesList onSelectDevice={openDevice} />
    {/if}

    {#if message}
        <p aria-live="polite">{message}</p>
    {/if}
</main>

<style>
    main {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }
</style>
