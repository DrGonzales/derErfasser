<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { addRecord } from "../lib/db";
    import { Devices } from "../lib/models";

    const dispatch = createEventDispatcher();

    let status = "Bereit zum Hochladen (Drag & Drop oder Klick).";
    let isLoading = false;

    async function handleFile(file: File) {
        try {
            isLoading = true;
            status = `Lade ${file.name}...`;

            const text = await file.text();
            const parsed = JSON.parse(text);

            // If the JSON looks like a devices model, store it under `devices`,
            // otherwise store it as the generic payload on `devices` as well so
            // the rest of the app can hydrate it into model classes.
            // Instantiate Devices so model constructors run before storing.
            const devicesModel = new Devices(
                typeof parsed === "object" ? parsed : { entries: [] },
            );

            const payload: any = {
                title: file.name.replace(/\.json$/i, ""),
                notes: "",
                devices: devicesModel,
            };

            await addRecord(payload);

            status = "Datei wurde in IndexedDB gespeichert.";
            dispatch("uploaded");
        } catch (err) {
            status = `Fehler: ${err instanceof Error ? err.message : String(err)}`;
        } finally {
            isLoading = false;
        }
    }

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
