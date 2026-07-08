<script lang="ts">
    import { ImageReference } from "../../lib/models";
    import { saveImageBlob } from "../../lib/db";

    let {
        pictures = [],
        onUploaded = undefined,
        persist = undefined,
    }: {
        pictures?: ImageReference[];
        onUploaded?: (pictures: ImageReference[]) => void;
        persist?: (pictures: ImageReference[]) => void | Promise<void>;
    } = $props();

    let fileInput: HTMLInputElement | null = null;
    let isUploading = $state(false);
    let uploadStatus = $state(
        "Bilder können per Drag & Drop oder Kamera hinzugefügt werden.",
    );

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
        isUploading = true;
        uploadStatus = "Bilder werden verarbeitet...";

        try {
            let updated = [...pictures];

            for (const file of Array.from(files)) {
                if (!file.type.startsWith("image/")) {
                    continue;
                }

                const resized = await resizeImageFile(file);
                const stored = await saveImageBlob(resized, file.name);
                if (!stored.id) {
                    continue;
                }

                updated = [...updated, new ImageReference({ id: stored.id })];
            }

            if (persist) {
                await persist(updated);
            }
            onUploaded?.(updated);
            uploadStatus = "Bilder erfolgreich gespeichert.";
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
</script>

<section class="images-section">
    <h3>Bilder</h3>

    <div
        class="image-drop"
        role="button"
        tabindex="0"
        ondrop={onImageDrop}
        ondragover={onImageDragOver}
        onclick={() => fileInput?.click()}
        onkeydown={onImageDropKeydown}
    >
        <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onchange={onImageInputChange}
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
