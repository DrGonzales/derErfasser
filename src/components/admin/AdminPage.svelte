<script lang="ts">
    import { onMount } from "svelte";
    import { deleteDatabase, getMeta, saveMeta } from "../../lib/db";
    import type { Meta } from "../../lib/db";
    import { downloadBlob } from "../../lib/download";
    import {
        inspectionNameSuggestions,
        rememberInspectionName,
    } from "../../lib/stores/inspectionNameSuggestions.svelte";
    import RestoreButton from "./RestoreButton.svelte";
    import ChangelogModal from "./ChangelogModal.svelte";
    import HelpModal from "./HelpModal.svelte";
    import ImportModal from "./ImportModal.svelte";
    import ExportButton from "./ExportButton.svelte";
    import InstallAppTile from "./InstallAppTile.svelte";
    import ConfirmDialog from "../shared/ConfirmDialog.svelte";
    import Button from "../shared/Button.svelte";

    let {
        hasData,
        onRestored,
        onMetaReady,
        onDataCleared,
    }: {
        hasData: boolean;
        onRestored: () => void;
        onMetaReady?: () => void;
        onDataCleared?: () => void;
    } = $props();

    let metaData = $state<Meta | undefined>(undefined);
    let editing = $state(false);

    // Werden im Excel-Import-Modal benötigt, um den Datei-auswählen-Button
    // nur zu aktivieren, wenn bereits Prüfobjekt-Daten hinterlegt sind.
    const hasMetaData = $derived(Boolean(metaData));

    // form fields (used both for create and edit)
    let fPruefObjekt = $state("");
    let fNamen = $state("");
    let fAnschrift = $state("");
    let fOrt = $state("");
    let fAktuellePruefung = $state("");

    let saving = $state(false);
    let saveError = $state("");

    // Daten löschen
    let confirmDeleteOpen = $state(false);
    let isDeleting = $state(false);
    let deleteError = $state("");

    // Changelog-Anzeige
    let changelogOpen = $state(false);

    // Anleitung-Anzeige
    let helpOpen = $state(false);

    // Excel-Import-Anzeige
    let importOpen = $state(false);

    onMount(async () => {
        metaData = await getMeta();
    });

    function startEdit() {
        if (metaData) {
            fPruefObjekt = metaData.pruefObjekt;
            fNamen = metaData.namen;
            fAnschrift = metaData.anschrift;
            fOrt = metaData.ort;
            fAktuellePruefung = metaData.aktuellePruefung;
        } else {
            fPruefObjekt = "";
            fNamen = "";
            fAnschrift = "";
            fOrt = "";
            fAktuellePruefung = "";
        }
        editing = true;
        saveError = "";
    }

    function cancelEdit() {
        editing = false;
        saveError = "";
    }

    async function handleSave() {
        saving = true;
        saveError = "";

        const trimmedAktuellePruefung = fAktuellePruefung.trim();

        if (!hasData && !trimmedAktuellePruefung) {
            saveError =
                "Solange keine Gerätedaten vorhanden sind, muss „Aktuelle Prüfung“ ausgefüllt werden, um fortfahren zu können.";
            saving = false;
            return;
        }

        try {
            const { Meta } = await import("../../lib/models");
            const m = new Meta({
                pruefObjekt: fPruefObjekt.trim(),
                namen: fNamen.trim(),
                anschrift: fAnschrift.trim(),
                ort: fOrt.trim(),
                aktuellePruefung: trimmedAktuellePruefung,
            });
            await saveMeta(m);
            metaData = m;
            editing = false;

            // Neu eingegebenen Prüfungsnamen sofort für zukünftige Eingaben
            // (Dropdown-Vorschläge) verfügbar machen.
            rememberInspectionName(trimmedAktuellePruefung);
        } catch (err) {
            saveError = `Speichern fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            saving = false;
        }
    }

    function openDeleteConfirm() {
        deleteError = "";
        confirmDeleteOpen = true;
    }

    function cancelDelete() {
        // "Nein" — es passiert nichts.
        confirmDeleteOpen = false;
    }

    async function confirmDelete() {
        isDeleting = true;
        deleteError = "";

        try {
            // jszip wird bewusst erst hier dynamisch nachgeladen, damit der
            // initiale App-Bundle nicht mit dem ZIP-Code aufgebläht wird.
            const { createIndexedDBBackupZip, buildBackupFilename } = await import(
                "../../lib/zipService"
            );
            const { blob, meta } = await createIndexedDBBackupZip();
            downloadBlob(blob, buildBackupFilename(meta?.pruefObjekt));
            await deleteDatabase();
            metaData = undefined;
            confirmDeleteOpen = false;
            onDataCleared?.();
        } catch (err) {
            deleteError = `Löschen fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isDeleting = false;
        }
    }
</script>

<div class="admin-page">
    <h2>Administration</h2>

    {#if !hasData}
        <p class="empty-hint">
            Keine Gerätedaten vorhanden. Entweder ein Backup wiederherstellen
            oder unter „Prüfobjekt“ die „Aktuelle Prüfung“ ausfüllen und
            speichern, um anschließend neue Geräte in der Einträge-Liste
            anzulegen.
        </p>
    {/if}

    <div class="admin-grid">
        <!-- ── Kachel 1: Prüfobjekt ─────────────────── -->
        <section class="tile panel-card">
            <h3>Prüfobjekt</h3>

            {#if metaData && !editing}
                <!-- DISPLAY mode -->
                <dl class="meta-list">
                    <div class="meta-row">
                        <dt>Prüfobjekt</dt>
                        <dd>{metaData.pruefObjekt || "–"}</dd>
                    </div>
                    <div class="meta-row">
                        <dt>Namen</dt>
                        <dd>{metaData.namen || "–"}</dd>
                    </div>
                    <div class="meta-row">
                        <dt>Anschrift</dt>
                        <dd>{metaData.anschrift || "–"}</dd>
                    </div>
                    <div class="meta-row">
                        <dt>Ort</dt>
                        <dd>{metaData.ort || "–"}</dd>
                    </div>
                    <div class="meta-row">
                        <dt>Aktuelle Prüfung</dt>
                        <dd>{metaData.aktuellePruefung || "–"}</dd>
                    </div>
                </dl>
                <div class="tile-actions">
                    <Button variant="secondary" onclick={startEdit}>Bearbeiten</Button>
                    {#if !hasData && metaData.aktuellePruefung && onMetaReady}
                        <Button variant="primary" onclick={onMetaReady}>
                            Weiter zu den Einträgen
                        </Button>
                    {/if}
                </div>

            {:else if editing}
                <!-- EDIT/CREATE form mode -->
                <form class="meta-form" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <label class="field">
                        <span>Prüfobjekt</span>
                        <input type="text" bind:value={fPruefObjekt} />
                    </label>
                    <label class="field">
                        <span>Namen</span>
                        <input type="text" bind:value={fNamen} />
                    </label>
                    <label class="field">
                        <span>Anschrift</span>
                        <input type="text" bind:value={fAnschrift} />
                    </label>
                    <label class="field">
                        <span>Ort</span>
                        <input type="text" bind:value={fOrt} />
                    </label>
                    <label class="field">
                        <span>Aktuelle Prüfung{!hasData ? " *" : ""}</span>
                        <input
                            type="text"
                            list="aktuelle-pruefung-options"
                            autocomplete="off"
                            bind:value={fAktuellePruefung}
                            required={!hasData}
                        />
                        <datalist id="aktuelle-pruefung-options">
                            {#each inspectionNameSuggestions.names as suggestion (suggestion)}
                                <option value={suggestion}></option>
                            {/each}
                        </datalist>
                    </label>
                    {#if !hasData}
                        <p class="field-hint">
                            Ohne vorhandene Gerätedaten muss „Aktuelle Prüfung“ ausgefüllt werden, um mit dem Anlegen von Geräten fortfahren zu können.
                        </p>
                    {/if}
                    {#if saveError}
                        <p class="save-error">{saveError}</p>
                    {/if}
                    <div class="tile-actions">
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? "Speichert..." : "Speichern"}
                        </Button>
                        {#if metaData}
                            <Button variant="secondary" onclick={cancelEdit} disabled={saving}>Abbrechen</Button>
                        {/if}
                    </div>
                </form>

            {:else}
                <!-- NO DATA yet -->
                <p class="no-meta-hint">Noch keine Prüfobjekt-Daten vorhanden.</p>
                <Button variant="primary" onclick={startEdit}>Daten eintragen</Button>
            {/if}
        </section>

        <!-- ── Kachel 2: Backup wiederherstellen ───── -->
        <section class="tile panel-card">
            <h3>Backup wiederherstellen</h3>
            <p>Backup-ZIP-Datei laden um alle Geräte und Bilder wiederherzustellen.</p>
            <p class="warn-hint">
                Achtung: Bestehende Daten (Geräte, Bilder und Prüfobjekt-Informationen) werden dabei vollständig überschrieben.
            </p>
            <RestoreButton onRestored={onRestored} />
        </section>

        <!-- ── Kachel 3: Geräte aus Excel importieren/exportieren ── -->
        <section class="tile panel-card">
            <h3>Geräte aus Excel importieren</h3>
            <p>
                Excel- oder CSV-Datei hochladen und Spalten den Gerätefeldern
                zuordnen, um mehrere Geräte auf einmal anzulegen.
            </p>
            <div class="tile-actions">
                <Button
                    variant="secondary"
                    onclick={() => (importOpen = true)}
                >
                    Excel-Datei importieren
                </Button>
                <ExportButton />
            </div>
            <p class="tile-hint">
                Der Export enthält alle Geräte sowie – sofern vorhanden – die
                Werte der aktuellen Prüfung „{metaData?.aktuellePruefung || "—"}“.
                Bilder und PDFs werden nicht exportiert.
            </p>
        </section>

        <!-- ── Kachel 4: App installieren ────────────── -->
        <InstallAppTile />

        <!-- ── Kachel 5: Daten löschen ──────────────── -->
        <section class="tile panel-card tile--danger">
            <h3>Daten löschen</h3>
            <p class="warn-hint">
                Achtung: Hiermit werden alle Geräte, Bilder und Prüfobjekt-Informationen unwiderruflich aus dieser App entfernt.
                Vor dem Löschen wird automatisch ein Backup heruntergeladen.
            </p>
            <Button
                variant="danger"
                onclick={openDeleteConfirm}
                disabled={isDeleting}
            >
                {isDeleting ? "Wird gelöscht..." : "Daten löschen"}
            </Button>
            {#if deleteError}
                <p class="save-error">{deleteError}</p>
            {/if}
        </section>
    </div>

    <div class="footer-links">
        <button
            type="button"
            class="changelog-link"
            onclick={() => (helpOpen = true)}
        >
            Anleitung
        </button>
        <button
            type="button"
            class="changelog-link"
            onclick={() => (changelogOpen = true)}
        >
            Changelog
        </button>
    </div>
</div>

{#if helpOpen}
    <HelpModal onClose={() => (helpOpen = false)} />
{/if}

{#if changelogOpen}
    <ChangelogModal onClose={() => (changelogOpen = false)} />
{/if}

{#if importOpen}
    <ImportModal
        {hasMetaData}
        onClose={() => (importOpen = false)}
        onImported={() => onRestored()}
    />
{/if}

{#if confirmDeleteOpen}
    <ConfirmDialog
        open={confirmDeleteOpen}
        title="Alle Daten wirklich löschen?"
        message="Es wird zunächst automatisch ein Backup heruntergeladen. Anschließend werden alle Geräte, Bilder und Prüfobjekt-Informationen unwiderruflich gelöscht."
        confirmLabel={isDeleting ? "Wird gelöscht..." : "Ja, Backup erstellen und löschen"}
        cancelLabel="Nein"
        busy={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
    />
    {#if deleteError}
        <p class="save-error">{deleteError}</p>
    {/if}
{/if}

<style>
    .admin-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .changelog-link {
        background: none;
        border: none;
        color: var(--color-muted);
        cursor: pointer;
        font-size: 0.85rem;
        padding: 0;
        text-decoration: underline;
    }

    .footer-links {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin: 1.5rem 0 0;
    }

    .changelog-link:hover,
    .changelog-link:focus-visible {
        color: var(--color-primary);
        outline: none;
    }

    h2 {
        margin-top: 0;
    }

    /* ── Kachel-Grid ─────────────────────────────── */
    .admin-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        align-items: start;
    }

    .tile {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .tile h3 {
        margin: 0;
        color: var(--color-primary);
    }

    .tile--danger {
        border-color: #ead1cc;
        background: #fff8f6;
    }

    .tile--danger h3 {
        color: var(--color-danger-text);
    }

    /* Display list */
    .meta-list {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .meta-row {
        display: flex;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .meta-row dt {
        flex-shrink: 0;
        min-width: 9rem;
        color: var(--color-muted);
        font-weight: 700;
    }

    .meta-row dd {
        margin: 0;
        color: var(--color-text);
        word-break: break-word;
    }

    /* Form */
    .meta-form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
    }

    .field {
        display: grid;
        gap: 0.3rem;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        font-weight: 600;
    }

    .field input {
        width: 100%;
        min-height: 40px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 12px;
        color: var(--color-text);
        background: #fbfcfa;
        font: inherit;
        font-weight: 400;
        box-sizing: border-box;
    }

    .field input:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    .tile-actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        margin-top: 0.25rem;
    }

    .tile-hint {
        margin-top: 0.5rem;
        font-size: 0.85rem;
        color: var(--color-muted);
    }

    /* Hints */
    .empty-hint {
        background: #fff8e1;
        border-left: 4px solid #f59e0b;
        padding: 0.75rem 1rem;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        margin: 0 0 1.25rem;
        font-size: 0.9rem;
    }

    .no-meta-hint {
        color: var(--color-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    .field-hint {
        color: var(--color-muted);
        font-size: 0.85rem;
        margin: -0.35rem 0 0;
    }

    .warn-hint {
        background: #fff8e1;
        border-left: 4px solid #f59e0b;
        padding: 0.6rem 0.85rem;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        font-size: 0.85rem;
        margin: 0;
    }

    .tile--danger .warn-hint {
        background: #fdecea;
        border-left-color: var(--color-danger);
        color: var(--color-danger-text);
    }

    .save-error {
        color: var(--color-danger-text);
        font-size: 0.9rem;
        margin: 0;
    }
</style>
