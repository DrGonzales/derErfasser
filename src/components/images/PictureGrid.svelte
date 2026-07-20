<script lang="ts">
    import { onDestroy } from "svelte";
    import type { ImageReference } from "../../lib/models";
    import { getImage } from "../../lib/db";
    import { TrashIcon } from "../icons";
    import ConfirmDialog from "../shared/ConfirmDialog.svelte";

    let {
        pictures = [] as ImageReference[],
        pictureUrls = undefined as Record<string, string> | undefined,
        onDelete = undefined,
    }: {
        pictures?: ImageReference[];
        pictureUrls?: Record<string, string> | undefined;
        onDelete?: (picture: ImageReference) => void | Promise<void>;
    } = $props();

    let internalPictureUrls: Record<string, string> = $state({});
    let blobUrls: string[] = [];
    let loadToken = 0;
    let selectedIndex: number | null = $state(null);
    let confirmTarget = $state<ImageReference | null>(null);
    let deleting = $state(false);

    const validPictures = $derived(
        pictures.filter(
            (pic) => typeof pic?.id === "string" && pic.id.trim().length > 0,
        ),
    );

    const urls: Record<string, string> = $derived(
        pictureUrls ?? internalPictureUrls,
    );

    const visiblePictures = $derived(
        validPictures.filter((picture) => urls[picture.id]),
    );

    // Clamp selectedIndex: if out of range, treat as null (derived)
    const clampedSelectedIndex = $derived(
        selectedIndex !== null &&
        selectedIndex < visiblePictures.length &&
        visiblePictures.length > 0
            ? selectedIndex
            : null,
    );

    const selectedPicture = $derived(
        clampedSelectedIndex === null
            ? undefined
            : visiblePictures[clampedSelectedIndex],
    );

    const selectedUrl = $derived(
        selectedPicture ? urls[selectedPicture.id] : undefined,
    );

    async function loadInternalUrls() {
        const token = ++loadToken;
        cleanupBlobUrls();
        internalPictureUrls = {};

        for (const picture of validPictures) {
            const stored = await getImage(picture.id);
            if (token !== loadToken) {
                return;
            }
            if (stored?.blob) {
                const url = URL.createObjectURL(stored.blob);
                blobUrls.push(url);
                internalPictureUrls = {
                    ...internalPictureUrls,
                    [picture.id]: url,
                };
            }
        }
    }

    function cleanupBlobUrls() {
        for (const url of blobUrls) {
            URL.revokeObjectURL(url);
        }
        blobUrls = [];
    }

    function openLightbox(index: number) {
        selectedIndex = index;
    }

    function requestDelete(picture: ImageReference, e: MouseEvent) {
        e.stopPropagation();
        confirmTarget = picture;
    }

    function cancelDeleteConfirm() {
        confirmTarget = null;
    }

    async function confirmDeleteConfirm() {
        if (!confirmTarget) return;
        deleting = true;
        try {
            await onDelete?.(confirmTarget);
        } finally {
            deleting = false;
            confirmTarget = null;
        }
    }

    function closeLightbox() {
        selectedIndex = null;
    }

    function showPreviousImage() {
        if (clampedSelectedIndex === null || visiblePictures.length === 0)
            return;
        selectedIndex =
            (clampedSelectedIndex - 1 + visiblePictures.length) %
            visiblePictures.length;
    }

    function showNextImage() {
        if (clampedSelectedIndex === null || visiblePictures.length === 0)
            return;
        selectedIndex =
            (clampedSelectedIndex + 1) % visiblePictures.length;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (clampedSelectedIndex === null) return;

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowLeft") {
            showPreviousImage();
        } else if (event.key === "ArrowRight") {
            showNextImage();
        }
    }

    $effect(() => {
        // validPictures lesen damit der Effect bei jeder Änderung der pictures neu feuert
        if (pictureUrls === undefined && validPictures.length > 0) {
            loadInternalUrls();
        }
    });

    onDestroy(() => {
        cleanupBlobUrls();
    });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visiblePictures.length > 0}
    <div class="picture-grid">
        {#each visiblePictures as picture, index (picture.id)}
            <div class="picture-thumb-wrap">
                <button
                    class="picture-thumb"
                    type="button"
                    aria-label="Gerätebild groß anzeigen"
                    onclick={() => openLightbox(index)}
                >
                    <img
                        src={urls[picture.id]}
                        alt="Gerätebild"
                        width="64"
                        height="64"
                    />
                </button>
                {#if onDelete}
                    <button
                        class="picture-delete-btn"
                        type="button"
                        aria-label="Bild löschen"
                        title="Bild löschen"
                        onclick={(e) => requestDelete(picture, e)}
                    >
                        <TrashIcon size={16} />
                    </button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

{#if selectedUrl}
    <div
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Bildansicht"
    >
        <button
            class="lightbox-close"
            type="button"
            aria-label="Bildansicht schließen"
            onclick={closeLightbox}
        >
            ×
        </button>

        {#if visiblePictures.length > 1}
            <button
                class="lightbox-nav lightbox-nav-previous"
                type="button"
                aria-label="Vorheriges Bild anzeigen"
                onclick={showPreviousImage}
            >
                ‹
            </button>
        {/if}

        <img class="lightbox-image" src={selectedUrl} alt="Gerätebild groß" />

        {#if visiblePictures.length > 1}
            <button
                class="lightbox-nav lightbox-nav-next"
                type="button"
                aria-label="Nächstes Bild anzeigen"
                onclick={showNextImage}
            >
                ›
            </button>
        {/if}
    </div>
{/if}

<ConfirmDialog
    open={confirmTarget !== null}
    title="Bild löschen?"
    message="Dieses Bild wird unwiderruflich gelöscht."
    busy={deleting}
    onConfirm={confirmDeleteConfirm}
    onCancel={cancelDeleteConfirm}
/>

<style>
    .picture-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
        gap: 0.5rem;
    }

    .picture-thumb {
        width: 80px;
        height: 80px;
        padding: 0;
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f8f8;
        cursor: pointer;
    }

    .picture-thumb img {
        width: 80px;
        height: 80px;
        object-fit: cover;
    }

    .picture-thumb:hover,
    .picture-thumb:focus-visible {
        border-color: #006c5b;
        outline: 2px solid #006c5b;
        outline-offset: 2px;
    }

    .picture-thumb-wrap {
        position: relative;
        width: 80px;
        height: 80px;
    }

    .picture-delete-btn {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 26px;
        height: 26px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 50%;
        background: var(--color-danger);
        color: #fff;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, background 0.15s;
        box-shadow: 0 1px 4px rgb(0 0 0 / 35%);
    }

    .picture-thumb-wrap:hover .picture-delete-btn,
    .picture-thumb-wrap:focus-within .picture-delete-btn,
    .picture-delete-btn:focus-visible {
        opacity: 1;
    }

    .picture-delete-btn:hover,
    .picture-delete-btn:focus-visible {
        background: #b91c1c;
        outline: none;
    }

    .lightbox {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4.5rem;
        background: rgba(0, 0, 0, 0.9);
    }

    .lightbox-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.35);
    }

    .lightbox-close,
    .lightbox-nav {
        position: fixed;
        border: 0;
        color: #fff;
        background: rgba(0, 0, 0, 0.45);
        cursor: pointer;
        line-height: 1;
    }

    .lightbox-close:hover,
    .lightbox-close:focus-visible,
    .lightbox-nav:hover,
    .lightbox-nav:focus-visible {
        background: rgba(255, 255, 255, 0.18);
        outline: 2px solid #fff;
        outline-offset: 2px;
    }

    .lightbox-close {
        top: 1rem;
        right: 1rem;
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        font-size: 3.25rem;
    }

    .lightbox-nav {
        top: 50%;
        width: 4rem;
        height: 5rem;
        border-radius: 8px;
        font-size: 4rem;
        transform: translateY(-50%);
    }

    .lightbox-nav-previous {
        left: 1rem;
    }

    .lightbox-nav-next {
        right: 1rem;
    }

    @media (max-width: 600px) {
        .lightbox {
            padding: 4rem 3.25rem;
        }

        .lightbox-close {
            width: 3.5rem;
            height: 3.5rem;
            font-size: 2.75rem;
        }

        .lightbox-nav {
            width: 3rem;
            height: 4rem;
            font-size: 3.25rem;
        }

        .lightbox-nav-previous {
            left: 0.25rem;
        }

        .lightbox-nav-next {
            right: 0.25rem;
        }
    }
</style>
