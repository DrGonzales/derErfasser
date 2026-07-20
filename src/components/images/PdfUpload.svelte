<script lang="ts">
    import { PdfReference } from "../../lib/models";
    import { savePdfBlob } from "../../lib/db";
    import { PdfIcon } from "../icons";

    let {
        pdfs = [],
        onUploaded = undefined,
        persist = undefined,
    }: {
        pdfs?: PdfReference[];
        onUploaded?: (pdfs: PdfReference[]) => void;
        persist?: (pdfs: PdfReference[]) => void | Promise<void>;
    } = $props();

    const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

    let fileInput: HTMLInputElement | null = null;
    let isUploading = $state(false);
    let uploadStatus = $state(
        "PDF-Dateien können per Drag & Drop hinzugefügt werden (max. 20 MB je Datei).",
    );

    function isPdfFile(file: File): boolean {
        return (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        );
    }

    async function handlePdfFiles(files: FileList | File[]) {
        isUploading = true;
        uploadStatus = "PDF-Dateien werden verarbeitet...";

        try {
            let updated = [...pdfs];
            const skippedMessages: string[] = [];

            for (const file of Array.from(files)) {
                if (!isPdfFile(file)) {
                    skippedMessages.push(
                        `"${file.name}" ist keine PDF-Datei.`,
                    );
                    continue;
                }

                if (file.size > MAX_PDF_SIZE_BYTES) {
                    skippedMessages.push(
                        `"${file.name}" ist zu groß (max. 20 MB).`,
                    );
                    continue;
                }

                const stored = await savePdfBlob(file, file.name);
                if (!stored.id) {
                    continue;
                }

                updated = [
                    ...updated,
                    new PdfReference({ id: stored.id, name: file.name }),
                ];
            }

            if (persist) {
                await persist(updated);
            }
            onUploaded?.(updated);

            uploadStatus =
                skippedMessages.length > 0
                    ? skippedMessages.join(" ")
                    : "PDF-Dateien erfolgreich gespeichert.";
        } catch (error) {
            uploadStatus = `Fehler beim Speichern: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            isUploading = false;
        }
    }

    function onPdfInputChange(e: Event) {
        const input = e.currentTarget as HTMLInputElement;
        if (input.files) {
            handlePdfFiles(input.files);
        }
        input.value = "";
    }

    function onPdfDrop(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer?.files) {
            handlePdfFiles(e.dataTransfer.files);
        }
    }

    function onPdfDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function onPdfDropKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput?.click();
        }
    }
</script>

<section class="pdfs-section">
    <div
        class="pdf-drop"
        role="button"
        tabindex="0"
        aria-label="PDF hochladen"
        ondrop={onPdfDrop}
        ondragover={onPdfDragOver}
        onclick={() => fileInput?.click()}
        onkeydown={onPdfDropKeydown}
    >
        <input
            bind:this={fileInput}
            type="file"
            accept="application/pdf"
            multiple
            onchange={onPdfInputChange}
            hidden
        />
        <PdfIcon size={56} />
    </div>
    <p>{uploadStatus}</p>
</section>

<style>
    .pdfs-section {
        margin-top: 1rem;
    }

    .pdf-drop {
        width: 128px;
        height: 128px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.75rem;
        border: 2px dashed var(--border, #bbb);
        border-radius: 8px;
        cursor: pointer;
        background: var(--bg, #fff);
        color: var(--color-primary, #555);
    }

    .pdf-drop:hover,
    .pdf-drop:focus {
        border-color: #006c5b;
    }
</style>
