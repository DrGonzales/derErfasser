<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords } from "./lib/db";
    import AdminPage from "./components/admin/AdminPage.svelte";
    import EntriesList from "./components/entries/EntriesList.svelte";
    import Device from "./components/device/Device.svelte";
    import SplashScreen from "./components/SplashScreen.svelte";

    let showSplash = $state(true);
    let uploadVersion = $state(0);
    let selectedRecord: {
        device: any;
        location: any;
        recordId: number;
    } | null = $state(null);
    let hasData = $state<boolean | null>(null);
    let showAdmin = $state(false);

    async function checkData() {
        const records = await getRecords();
        hasData = records.length > 0;
    }

    onMount(() => {
        checkData();
    });

    function openDevice(record: {
        device: any;
        location: any;
        recordId: number;
    }) {
        selectedRecord = {
            device: record.device,
            location: record.location,
            recordId: record.recordId,
        };
    }

    function handleDeviceUpdated() {
        uploadVersion += 1;
    }

    function closeDevice() {
        selectedRecord = null;
    }

    async function handleRestored() {
        showAdmin = false;
        await checkData();
        uploadVersion += 1;
    }

    function handleAdminNav() {
        showAdmin = true;
        selectedRecord = null;
    }
</script>

{#if showSplash}
    <SplashScreen onDone={() => (showSplash = false)} />
{/if}

{#if !showSplash}
    <main>
        {#if hasData === null}
            <p class="loading">Lädt...</p>
        {:else if showAdmin || hasData === false}
            <AdminPage
                hasData={hasData ?? false}
                onRestored={handleRestored}
                onBack={hasData ? () => (showAdmin = false) : undefined}
            />
        {:else}
            <header class="app-header">
                <h1>Der Erfasser !</h1>
                <button
                    type="button"
                    class="admin-btn"
                    onclick={handleAdminNav}
                >
                    Admin
                </button>
            </header>

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
        {/if}
    </main>
{/if}

<style>
    main {
        padding: 1rem;
        max-width: 900px;
        margin: 0 auto;
    }

    .app-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .app-header h1 {
        margin: 0;
    }

    .admin-btn {
        padding: 0.4rem 0.9rem;
        border: 1px solid #235347;
        border-radius: 6px;
        background: transparent;
        color: #235347;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        transition:
            background 0.15s,
            color 0.15s;
    }

    .admin-btn:hover,
    .admin-btn:focus-visible {
        background: #235347;
        color: #fff;
        outline: none;
    }

    .loading {
        text-align: center;
        padding: 3rem;
        color: #667970;
    }
</style>
