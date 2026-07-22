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
    import Dashboard from "./components/dashboard/Dashboard.svelte";
    import EntriesList from "./components/entries/EntriesList.svelte";
    import Device from "./components/device/Device.svelte";
    import SplashScreen from "./components/SplashScreen.svelte";
    import AppHeader from "./components/shared/AppHeader.svelte";

    let showSplash = $state(true);
    let uploadVersion = $state(0);
    let selectedRecord: {
        device: any;
        location?: any;
        recordId: number;
    } | null = $state(null);
    let hasData = $state<boolean | null>(null);
    let showAdmin = $state(false);
    let showDashboard = $state(false);
    // Wird true, sobald im Admin-Bereich (ohne vorhandene Geräte) die Meta-Daten
    // inkl. "aktuelle Prüfung" gespeichert wurden und der Nutzer in die
    // Einträge-Liste gewechselt ist, um neue Geräte anzulegen.
    let metaConfirmed = $state(false);

    const showAdminView = $derived(
        showAdmin || (hasData === false && !metaConfirmed),
    );

    // Solange noch keine Daten vorhanden sind und der Nutzer die
    // Ersteinrichtung (Prüfobjekt anlegen / Backup wiederherstellen) noch
    // nicht abgeschlossen hat, darf nicht über den Header weggenavigiert
    // werden können.
    const canNavigate = $derived(hasData === true || metaConfirmed);

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
        showDashboard = false;
        selectedRecord = null;
    }

    function handleDashboardNav() {
        showDashboard = true;
        showAdmin = false;
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
        {:else}
            <AppHeader
                onDashboard={canNavigate ? handleDashboardNav : undefined}
                onAdmin={canNavigate ? handleAdminNav : undefined}
                activeNav={showDashboard
                    ? "dashboard"
                    : showAdminView
                      ? "admin"
                      : null}
            />

            {#if showDashboard}
                <Dashboard onBack={() => (showDashboard = false)} />
            {:else if showAdminView}
                <AdminPage
                    hasData={hasData ?? false}
                    onRestored={handleRestored}
                    onMetaReady={handleMetaReady}
                    onDataCleared={handleDataCleared}
                    onBack={hasData || metaConfirmed
                        ? () => (showAdmin = false)
                        : undefined}
                />
            {:else}
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
        {/if}
    </main>
{/if}

<style>
    main {
        padding: 1rem;
        max-width: 900px;
        margin: 0 auto;
    }

    .loading {
        text-align: center;
        padding: 3rem;
        color: #667970;
    }
</style>
