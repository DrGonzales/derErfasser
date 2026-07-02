<script lang="ts">
    import Upload from "./components/Upload.svelte";
    import EntriesList from "./components/EntriesList.svelte";
    import Device from "./components/Device.svelte";
    import { uploadCounter } from "./lib/stores/uploadStore";

    let message = "";
    let selectedDevice: any = null;

    // show a message when an upload happens (uploadCounter increments)
    $: if ($uploadCounter) {
        message = "Upload abgeschlossen. Die App hat Daten in IndexedDB.";
    }

    function openDevice(d: any) {
        selectedDevice = d;
    }

    function closeDevice() {
        selectedDevice = null;
    }
</script>

<main>
    <h1>derErfasser</h1>
    <Upload />

    {#if selectedDevice}
        <Device device={selectedDevice} onBack={closeDevice} />
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
