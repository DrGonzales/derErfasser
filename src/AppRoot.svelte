<script lang="ts">
    import Upload from "./components/Upload.svelte";
    import EntriesList from "./components/EntriesList.svelte";

    let message = "";
    let refresh = 0;

    function onUploaded() {
        message = "Upload abgeschlossen. Die App hat Daten in IndexedDB.";
        // increment to signal EntriesList to reload
        refresh = refresh + 1;
    }
</script>

<main>
    <h1>derErfasser</h1>
    <Upload on:uploaded={onUploaded} />

    <EntriesList {refresh} />

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
