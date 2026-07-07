<script lang="ts">
    import Upload from "./components/Upload.svelte";
    import EntriesList from "./components/EntriesList.svelte";
    import Device from "./components/Device.svelte";
    import SplashScreen from "./components/SplashScreen.svelte";

    let showSplash = $state(true);
    let message = $state("");
    let uploadVersion = $state(0);
    let selectedRecord: { device: any; location: any; recordId: number } | null = $state(null);

    function handleUpload() {
        message = "Upload abgeschlossen. Die App hat Daten in IndexedDB.";
        uploadVersion += 1;
    }

    function openDevice(record: { device: any; location: any; recordId: number }) {
        selectedRecord = { device: record.device, location: record.location, recordId: record.recordId };
    }

    function handleDeviceUpdated() {
        uploadVersion += 1;
    }

    function closeDevice() {
        selectedRecord = null;
    }
</script>

{#if showSplash}
    <SplashScreen onDone={() => (showSplash = false)} />
{/if}

{#if !showSplash}
<main>
    <h1>derErfasser</h1>
    <Upload onUpload={handleUpload} />

    <div hidden={!!selectedRecord}>
        <EntriesList onSelectDevice={openDevice} {uploadVersion} />
    </div>

    {#if selectedRecord}
        <Device
            device={selectedRecord.device}
            location={selectedRecord.location}
            recordId={selectedRecord.recordId}
            onBack={closeDevice}
            onDeviceUpdated={handleDeviceUpdated}
        />
    {/if}

    {#if message}
        <p aria-live="polite">{message}</p>
    {/if}
</main>
{/if}

<style>
    main {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }
</style>
