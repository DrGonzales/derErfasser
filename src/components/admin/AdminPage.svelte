<script lang="ts">
    import { onMount } from "svelte";
    import { getMeta, saveMeta } from "../lib/db";
    import type { Meta } from "../lib/db";
    import RestoreButton from "./RestoreButton.svelte";

    let {
        hasData,
        onRestored,
        onBack,
    }: {
        hasData: boolean;
        onRestored: () => void;
        onBack?: () => void;
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
        try {
            const { Meta } = await import("../lib/models");
            const m = new Meta({
                pruefObjekt: fPruefObjekt.trim(),
                namen: fNamen.trim(),
                anschrift: fAnschrift.trim(),
                ort: fOrt.trim(),
                aktuellePruefung: fAktuellePruefung.trim(),
            });
            await saveMeta(m);
            metaData = m;
            editing = false;
        } catch (err) {
            saveError = `Speichern fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            saving = false;
        }
    }
</script>

<div class="admin-page">
    {#if hasData && onBack}
        <button class="back-btn" onclick={onBack}>← Zurück</button>
    {/if}

    <h2>Administration</h2>

    <!-- ── Prüfobjekt section ───────────────────── -->
    <section class="section">
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
            <button type="button" class="btn btn--secondary" onclick={startEdit}>Bearbeiten</button>

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
                    <span>Aktuelle Prüfung</span>
                    <input type="text" bind:value={fAktuellePruefung} />
                </label>
                {#if saveError}
                    <p class="save-error">{saveError}</p>
                {/if}
                <div class="form-actions">
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

    <!-- ── No-records hint ──────────────────────── -->
    {#if !hasData}
        <p class="empty-hint">Keine Gerätedaten vorhanden. Bitte ein Backup wiederherstellen.</p>
    {/if}

    <!-- ── Backup wiederherstellen section ─────── -->
    <section class="section">
        <h3>Backup wiederherstellen</h3>
        <p>Backup-ZIP-Datei laden um alle Geräte und Bilder wiederherzustellen.</p>
        <RestoreButton onRestored={onRestored} />
    </section>
</div>

<style>
    .admin-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .back-btn {
        background: none;
        border: none;
        color: #235347;
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: block;
        padding: 0;
    }

    .back-btn:hover {
        text-decoration: underline;
    }

    h2 {
        margin-top: 0;
    }

    .section {
        margin-top: 1.75rem;
        padding-top: 1.75rem;
        border-top: 1px solid #d8ded4;
    }

    .section:first-of-type {
        border-top: none;
        margin-top: 0;
        padding-top: 0;
    }

    h3 {
        margin-top: 0;
        color: #235347;
    }

    /* Display list */
    .meta-list {
        margin: 0 0 1rem;
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
        color: #667970;
        font-weight: 700;
    }

    .meta-row dd {
        margin: 0;
        color: #17211d;
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
        color: #31433b;
        font-weight: 600;
    }

    .field input {
        width: 100%;
        min-height: 40px;
        border: 1px solid #cbd4ca;
        border-radius: 6px;
        padding: 0 12px;
        color: #17211d;
        background: #fbfcfa;
        font: inherit;
        font-weight: 400;
        box-sizing: border-box;
    }

    .field input:focus {
        border-color: #235347;
        outline: 3px solid rgb(35 83 71 / 20%);
    }

    .form-actions {
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
        border: 1px solid #235347;
        background: #235347;
        color: #fff;
    }

    .btn--primary:hover:not(:disabled),
    .btn--primary:focus-visible:not(:disabled) {
        background: #1a3f35;
        outline: none;
    }

    .btn--primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .btn--secondary {
        border: 1px solid #235347;
        background: transparent;
        color: #235347;
    }

    .btn--secondary:hover:not(:disabled),
    .btn--secondary:focus-visible:not(:disabled) {
        background: #e4efe6;
        outline: none;
    }

    /* Hints */
    .empty-hint {
        background: #fff8e1;
        border-left: 4px solid #f59e0b;
        padding: 0.75rem 1rem;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        margin-top: 1.25rem;
        font-size: 0.9rem;
    }

    .no-meta-hint {
        color: #667970;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
    }

    .save-error {
        color: #a00;
        font-size: 0.9rem;
        margin: 0;
    }
</style>
