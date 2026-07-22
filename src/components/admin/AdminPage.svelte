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
    import BackButton from "../shared/BackButton.svelte";

    let {
        hasData,
        onRestored,
        onBack,
        onMetaReady,
        onDataCleared,
    }: {
        hasData: boolean;
        onRestored: () => void;
        onBack?: () => void;
        onMetaReady?: () => void;
        onDataCleared?: () => void;
    } = $props();

    let metaData = $state<Meta | undefined>(undefined);
    let editing = $state(false);

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
    {#if onBack}
        <div class="back-row">
            <BackButton onClick={onBack} />
        </div>
    {/if}

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
                    <button type="button" class="btn btn--secondary" onclick={startEdit}>Bearbeiten</button>
                    {#if !hasData && metaData.aktuellePruefung && onMetaReady}
                        <button type="button" class="btn btn--primary" onclick={onMetaReady}>
                            Weiter zu den Einträgen
                        </button>
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
                        <button type="submit" class="btn btn--primary" disabled={saving}>
                            {saving ? "Speichert..." : "Speichern"}
                        </button>
                        {#if metaData}
                            <button type="button" class="btn btn--secondary" onclick={cancelEdit} disabled={saving}>Abbrechen</button>
                        {/if}
                    </div>
                </form>

            {:else}
                <!-- NO DATA yet -->
                <p class="no-meta-hint">Noch keine Prüfobjekt-Daten vorhanden.</p>
                <button type="button" class="btn btn--primary" onclick={startEdit}>Daten eintragen</button>
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

        <!-- ── Kachel 3: Daten löschen ──────────────── -->
        <section class="tile panel-card tile--danger">
            <h3>Daten löschen</h3>
            <p class="warn-hint">
                Achtung: Hiermit werden alle Geräte, Bilder und Prüfobjekt-Informationen unwiderruflich aus dieser App entfernt.
                Vor dem Löschen wird automatisch ein Backup heruntergeladen.
            </p>
            <button
                type="button"
                class="btn btn--danger"
                onclick={openDeleteConfirm}
                disabled={isDeleting}
            >
                {isDeleting ? "Wird gelöscht..." : "Daten löschen"}
            </button>
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

{#if confirmDeleteOpen}
    <div class="confirm-backdrop" role="dialog" aria-modal="true" aria-label="Daten löschen bestätigen">
        <div class="confirm-panel">
            <svg
                class="confirm-icon"
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M12 3 21 19 3 19Z" />
                <line x1="12" y1="9.5" x2="12" y2="13.5" />
                <line x1="12" y1="16.3" x2="12" y2="16.4" />
            </svg>
            <h3>Alle Daten wirklich löschen?</h3>
            <p>
                Es wird zunächst automatisch ein Backup heruntergeladen. Anschließend werden alle Geräte, Bilder und
                Prüfobjekt-Informationen unwiderruflich gelöscht.
            </p>
            {#if deleteError}
                <p class="save-error">{deleteError}</p>
            {/if}
            <div class="confirm-actions">
                <button type="button" class="btn btn--secondary" onclick={cancelDelete} disabled={isDeleting}>
                    Nein
                </button>
                <button type="button" class="btn btn--danger" onclick={confirmDelete} disabled={isDeleting}>
                    {isDeleting ? "Wird gelöscht..." : "Ja, Backup erstellen und löschen"}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .admin-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .back-row {
        margin-bottom: 0.75rem;
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

    /* Buttons */
    .btn {
        padding: 0.45rem 1rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
    }

    .btn--primary {
        border: 1px solid var(--color-primary);
        background: var(--color-primary);
        color: #fff;
    }

    .btn--primary:hover:not(:disabled),
    .btn--primary:focus-visible:not(:disabled) {
        background: var(--color-primary-hover);
        outline: none;
    }

    .btn--primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .btn--secondary {
        border: 1px solid var(--color-primary);
        background: transparent;
        color: var(--color-primary);
    }

    .btn--secondary:hover:not(:disabled),
    .btn--secondary:focus-visible:not(:disabled) {
        background: #e4efe6;
        outline: none;
    }

    .btn--danger {
        align-self: flex-start;
        border: 1px solid var(--color-danger);
        background: var(--color-danger);
        color: #fff;
    }

    .btn--danger:hover:not(:disabled),
    .btn--danger:focus-visible:not(:disabled) {
        background: #b91c1c;
        outline: none;
    }

    .btn--danger:disabled {
        opacity: 0.65;
        cursor: not-allowed;
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

    /* ── Bestätigungs-Dialog ──────────────────────── */
    .confirm-backdrop {
        position: fixed;
        inset: 0;
        z-index: 300;
        background: rgb(0 0 0 / 45%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .confirm-panel {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgb(0 0 0 / 25%);
        width: 100%;
        max-width: 420px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        text-align: center;
    }

    .confirm-icon {
        color: var(--color-danger);
    }

    .confirm-panel h3 {
        margin: 0;
        color: var(--color-danger-text);
    }

    .confirm-panel p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }

    .confirm-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
</style>
