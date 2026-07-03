<script lang="ts">
    import { onDestroy, createEventDispatcher } from "svelte";
    import type { Device as DeviceModel } from "../lib/models";
    import { ImageReference } from "../lib/models";
    import {
        getImage,
        saveImageBlob,
        getRecord,
        updateRecord,
    } from "../lib/db";

    export let device: DeviceModel | null = null;
    export let recordId: number | null = null;
    let displayPictures: ImageReference[] = [];

    $: displayPictures =
        device?.pictures?.filter(
            (pic) => typeof pic?.id === "string" && pic.id.trim().length > 0,
        ) ?? [];

    const dispatch = createEventDispatcher();

    let fileInput: HTMLInputElement | null = null;
    let pictureUrls: Record<string, string> = {};
    let blobUrls: string[] = [];
    let isUploading = false;
    let uploadStatus =
        "Bilder können per Drag & Drop oder Kamera hinzugefügt werden.";

    async function loadPictures() {
        const validPics =
            device?.pictures?.filter(
                (pic) => typeof pic.id === "string" && pic.id.trim().length > 0,
            ) ?? [];
        if (validPics.length === 0) {
            cleanupBlobUrls();
            pictureUrls = {};
            return;
        }

        const newUrls: Record<string, string> = {};
        cleanupBlobUrls();

        for (const pic of validPics) {
            const stored = await getImage(pic.id);
            if (stored && stored.blob) {
                const url = URL.createObjectURL(stored.blob);
                newUrls[pic.id] = url;
                blobUrls.push(url);
            }
        }

        pictureUrls = newUrls;
    }

    function cleanupBlobUrls() {
        for (const url of blobUrls) {
            URL.revokeObjectURL(url);
        }
        blobUrls = [];
    }

    onDestroy(() => {
        cleanupBlobUrls();
    });

    async function resizeImageFile(file: File): Promise<Blob> {
        const maxEdge = 1200;
        const imageBitmap = await createImageBitmap(file);
        const { width, height } = imageBitmap;
        let scale = 1;

        if (width > height && width > maxEdge) {
            scale = maxEdge / width;
        } else if (height > width && height > maxEdge) {
            scale = maxEdge / height;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Canvas wird nicht unterstützt.");
        }
        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
        imageBitmap.close();

        return new Promise<Blob>((resolve, reject) => {
            const outputType = file.type || "image/jpeg";
            const quality = outputType === "image/jpeg" ? 0.92 : undefined;

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Bild konnte nicht erstellt werden."));
                        return;
                    }
                    resolve(blob);
                },
                outputType,
                quality,
            );
        });
    }

    async function handleImageFiles(files: FileList | File[]) {
        if (!device || recordId == null) return;
        isUploading = true;
        uploadStatus = "Bilder werden verarbeitet...";

        try {
            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) {
                    continue;
                }

                const resized = await resizeImageFile(file);
                const stored = await saveImageBlob(resized, file.name);
                if (!stored.id) {
                    continue;
                }

                const ref = new ImageReference({ id: stored.id });
                device.pictures = [...device.pictures, ref];

                const record = await getRecord(recordId);
                if (record) {
                    record.device = device;
                    await updateRecord(record);
                }
            }

            await loadPictures();
            uploadStatus = "Bilder erfolgreich gespeichert.";
            dispatch("updated", { device, recordId });
        } catch (error) {
            uploadStatus = `Fehler beim Speichern: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            isUploading = false;
        }
    }

    function onImageInputChange(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        if (input.files) {
            handleImageFiles(input.files);
        }
        input.value = "";
    }

    function onImageDrop(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer?.files) {
            handleImageFiles(e.dataTransfer.files);
        }
    }

    function onImageDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function onImageDropKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput?.click();
        }
    }

    $: if (device) {
        loadPictures();
    }
</script>

<section class="images-section">
    <h3>Bilder</h3>

    <div
        class="image-drop"
        role="button"
        tabindex="0"
        on:drop={onImageDrop}
        on:dragover={onImageDragOver}
        on:click={() => fileInput?.click()}
        on:keydown={onImageDropKeydown}
    >
        <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            on:change={onImageInputChange}
            hidden
        />
        <div>
            <strong>Bild hochladen</strong>
        </div>
        <div class="hint">
            Drag & Drop oder tippen, um Bilder auszuwählen. Auf Mobilgeräten
            kann auch die Kamera verwendet werden.
        </div>
    </div>
    <p>{uploadStatus}</p>
</section>

<style>
    .images-section {
        margin-top: 1rem;
    }

    .image-drop {
        border: 2px dashed var(--border, #bbb);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        background: var(--bg, #fff);
        margin-bottom: 0.75rem;
    }

    .image-drop:hover,
    .image-drop:focus {
        border-color: #006c5b;
    }

    .hint {
        color: #555;
        font-size: 0.95rem;
    }
</style>
