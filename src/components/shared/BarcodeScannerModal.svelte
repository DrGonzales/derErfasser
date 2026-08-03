<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { IScannerControls } from "@zxing/browser";
    import CloseButton from "./CloseButton.svelte";

    let {
        onDetected,
        onClose,
    }: {
        onDetected: (code: string) => void;
        onClose: () => void;
    } = $props();

    let videoEl: HTMLVideoElement | undefined = $state();
    let errorMessage: string | null = $state(null);

    let controls: IScannerControls | null = null;
    let cancelled = false;

    function stopScanning(): void {
        controls?.stop();
        controls = null;
    }

    function handleClose(): void {
        stopScanning();
        onClose();
    }

    onMount(() => {
        void startScanning();
    });

    async function startScanning(): Promise<void> {
        try {
            const { BrowserMultiFormatReader } = await import("@zxing/browser");
            if (cancelled) {
                return;
            }

            const codeReader = new BrowserMultiFormatReader();
            const nextControls = await codeReader.decodeFromVideoDevice(
                undefined,
                videoEl as HTMLVideoElement,
                (result, error, currentControls) => {
                    if (result) {
                        currentControls.stop();
                        controls = null;
                        onDetected(result.getText());
                        onClose();
                    }
                    // error ist bei "kein Code im aktuellen Frame gefunden" normal - ignorieren.
                },
            );

            if (cancelled) {
                nextControls.stop();
                return;
            }

            controls = nextControls;
        } catch (err) {
            if (cancelled) {
                return;
            }
            errorMessage = describeError(err);
        }
    }

    function describeError(err: unknown): string {
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError") {
            return "Kamerazugriff wurde verweigert oder ist nicht möglich.";
        }
        if (name === "NotFoundError") {
            return "Es wurde keine Kamera gefunden.";
        }
        const message = err instanceof Error ? err.message : String(err);
        return `Kamera konnte nicht gestartet werden: ${message}`;
    }

    onDestroy(() => {
        cancelled = true;
        stopScanning();
    });
</script>

<div class="scanner-backdrop" role="dialog" aria-modal="true" aria-label="Barcode scannen">
    <div class="scanner-panel">
        <div class="scanner-header">
            <h3>Barcode scannen</h3>
            <CloseButton onClick={handleClose} />
        </div>

        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {:else}
            <video bind:this={videoEl} autoplay muted playsinline></video>
            <p class="hint">Halte den Barcode vor die Kamera.</p>
        {/if}
    </div>
</div>

<style>
    .scanner-backdrop {
        position: fixed;
        inset: 0;
        z-index: var(--z-confirm);
        background: var(--modal-backdrop-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .scanner-panel {
        background: var(--color-surface);
        border-radius: 12px;
        box-shadow: var(--modal-panel-shadow);
        width: 100%;
        max-width: 480px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .scanner-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .scanner-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
    }

    video {
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: 8px;
        background: #000;
        object-fit: cover;
    }

    .hint {
        color: var(--color-muted);
        font-size: 0.9rem;
        margin: 0;
        text-align: center;
    }

    .error {
        color: var(--color-danger-text);
        font-size: 0.9rem;
        margin: 0;
    }
</style>
