<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords } from "./lib/db";
    import {
        initLocationSuggestions,
        resetLocationSuggestions,
    } from "./lib/stores/locationSuggestions.svelte";
    import {
        initInspectionNameSuggestions,
        resetInspectionNameSuggestions,
    } from "./lib/stores/inspectionNameSuggestions.svelte";
    import AdminPage from "./components/admin/AdminPage.svelte";
    import EntriesList from "./components/entries/EntriesList.svelte";
    import Device from "./components/device/Device.svelte";
    import SplashScreen from "./components/SplashScreen.svelte";

    let showSplash = $state(true);
    let uploadVersion = $state(0);
    let selectedRecord: {
        device: any;
        location?: any;
        recordId: number;
    } | null = $state(null);
    let hasData = $state<boolean | null>(null);
    let showAdmin = $state(false);
    // Wird true, sobald im Admin-Bereich (ohne vorhandene Geräte) die Meta-Daten
    // inkl. "aktuelle Prüfung" gespeichert wurden und der Nutzer in die
    // Einträge-Liste gewechselt ist, um neue Geräte anzulegen.
    let metaConfirmed = $state(false);

    const showAdminView = $derived(
        showAdmin || (hasData === false && !metaConfirmed),
    );

    async function checkData() {
        const records = await getRecords();
        hasData = records.length > 0;
    }

    onMount(() => {
        checkData();
        // Standort-Vorschläge (Standortname/Gebäude/Raum) einmalig beim
        // Start der App aus dem gesamten Datenbestand aggregieren.
        initLocationSuggestions();
        // Prüfungsnamen-Vorschläge ("Aktuelle Prüfung") ebenfalls einmalig
        // beim Start aggregieren.
        initInspectionNameSuggestions();
    });

    function openDevice(record: {
        device: any;
        location?: any;
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
        // Datenbestand wurde vollständig ersetzt: Vorschlagslisten müssen
        // beim nächsten Zugriff neu aus der Datenbank aggregiert werden.
        resetLocationSuggestions();
        resetInspectionNameSuggestions();
        await checkData();
        initLocationSuggestions();
        initInspectionNameSuggestions();
        uploadVersion += 1;
    }

    function handleAdminNav() {
        showAdmin = true;
        selectedRecord = null;
    }

    function handleMetaReady() {
        // Meta-Daten (mit aktuellePruefung) wurden gespeichert, obwohl noch
        // keine Geräte existieren. Navigation in die Einträge-Liste freigeben,
        // damit dort neue Geräte angelegt werden können.
        metaConfirmed = true;
        showAdmin = false;
    }

    async function handleDataCleared() {
        // Nach dem Löschen aller Daten zurück in den "keine Daten"-Zustand
        // versetzen, damit der Admin-Bereich (Prüfobjekt/Backup) erneut
        // durchlaufen werden muss.
        metaConfirmed = false;
        showAdmin = false;
        resetLocationSuggestions();
        resetInspectionNameSuggestions();
        await checkData();
    }
</script>

{#if showSplash}
    <SplashScreen onDone={() => (showSplash = false)} />
{/if}

{#if !showSplash}
    <main>
        {#if hasData === null}
            <p class="loading">Lädt...</p>
        {:else if showAdminView}
            <AdminPage
                hasData={hasData ?? false}
                onRestored={handleRestored}
                onMetaReady={handleMetaReady}
                onDataCleared={handleDataCleared}
                onBack={hasData || metaConfirmed ? () => (showAdmin = false) : undefined}
            />
        {:else}
            <header class="app-header">
                <div class="app-title">
                    <img src="/duspol.svg" alt="" class="app-logo" />
                    <h1>Prüftool</h1>
                </div>
                <button
                    type="button"
                    class="admin-btn"
                    aria-label="Admin"
                    title="Admin"
                    onclick={handleAdminNav}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 11.5 12 4l9 7.5" />
                        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
                    </svg>
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

    .app-title {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .app-logo {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
    }

    .app-header h1 {
        margin: 0;
    }

    .admin-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 1px solid #235347;
        border-radius: 6px;
        background: transparent;
        color: #235347;
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
