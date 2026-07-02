<script lang="ts">
    import { addRecord, getRecords, clearRecords } from "../lib/db";
    import { Devices, Metadata } from "../lib/models";

    import { incrementUpload } from "../lib/stores/uploadStore";
    import { onMount } from "svelte";

    let existingMetadata: Metadata | null = null;
    let totalEntries = 0;

    let status = "Bereit zum Hochladen (Drag & Drop oder Klick).";
    let isLoading = false;

    async function handleFile(file: File) {
        try {
            isLoading = true;
            status = `Lade ${file.name}...`;

            const text = await file.text();
            const parsed = JSON.parse(text);

            // Validate expected format: must be an object with an `entries` array.
            if (
                typeof parsed !== "object" ||
                parsed === null ||
                !Array.isArray((parsed as any).entries)
            ) {
                status = "Format stimmt nicht";
                return;
            }

            // Instantiate Devices so model constructors run before storing.
            const devicesModel = new Devices(parsed);

            // Set last backup timestamp on metadata
            if (!devicesModel.metadata) {
                devicesModel.metadata = new Metadata();
            }
            devicesModel.metadata.lastback = Date.now();

            const payload: any = {
                title: file.name.replace(/\.json$/i, ""),
                notes: "",
                devices: devicesModel,
            };

            // Clear existing records before storing the new upload
            await clearRecords();

            await addRecord(payload);

            status = "Datei wurde in IndexedDB gespeichert.";
            // Signal other components via the shared store instead of a dispatched event.
            incrementUpload();
            // reload local preview of metadata / counts
            await loadExisting();
        } catch (err) {
            status = `Fehler: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isLoading = false;
        }
    }

    async function loadExisting() {
        try {
            const records = await getRecords();
            totalEntries = 0;
            existingMetadata = null;

            if (records.length > 0) {
                // use newest record's metadata
                const newest = records[0];
                existingMetadata = (newest as any).devices?.metadata ?? null;

                for (const r of records) {
                    const devs: any = (r as any).devices;
                    if (devs && Array.isArray(devs.entries)) {
                        totalEntries += devs.entries.length;
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }

    onMount(() => {
        loadExisting();
    });

    function onInputChange(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        const file = input.files?.[0];
        if (file) handleFile(file);
        // clear so same file can be re-picked
        input.value = "";
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
    }
</script>

<div class="upload">
    {#if existingMetadata || totalEntries}
        <div class="existing">
            <div><strong>Vorhandene Daten:</strong></div>
            {#if existingMetadata}
                <div>Inspector: {existingMetadata.inspector ?? "-"}</div>
                <div>
                    Letztes Backup: {existingMetadata.lastback
                        ? new Date(existingMetadata.lastback).toLocaleString()
                        : "-"}
                </div>
            {/if}
            <div>Anzahl Geräte-Einträge: {totalEntries}</div>
        </div>
    {/if}
    <div class="drop" on:drop={onDrop} on:dragover={onDragOver}>
        <label>
            <input
                accept="application/json"
                type="file"
                on:change={onInputChange}
            />
            <div>
                <strong>JSON-Datei hochladen</strong>
            </div>
            <div class="hint">
                Drag & Drop oder klicken, um eine .json Datei zu waehlen
            </div>
        </label>
    </div>

    <p aria-live="polite">{isLoading ? "Verarbeite..." : status}</p>
</div>

<style>
    .drop {
        border: 2px dashed var(--border, #bbb);
        padding: 1.25rem;
        border-radius: 8px;
        text-align: center;
        background: var(--bg, #fff);
    }

    .hint {
        color: #666;
        font-size: 0.95rem;
    }

    input[type="file"] {
        display: none;
    }
</style>
