<script lang="ts">
    import Upload from "./components/Upload.svelte";
    import EntriesList from "./components/EntriesList.svelte";
    import Device from "./components/Device.svelte";

    let message = $state("");
    let uploadVersion = $state(0);
    let selectedRecord: { device: any; recordId: number } | null = $state(null);

    function handleUpload() {
        message = "Upload abgeschlossen. Die App hat Daten in IndexedDB.";
        uploadVersion += 1;
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
    <Upload onUpload={handleUpload} />

    {#if selectedRecord}
        <Device
            device={selectedRecord.device}
            recordId={selectedRecord.recordId}
            onBack={closeDevice}
        />
    {:else}
        <EntriesList onSelectDevice={openDevice} {uploadVersion} />
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
