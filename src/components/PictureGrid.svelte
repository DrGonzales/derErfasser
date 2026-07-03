<script lang="ts">
    import { onDestroy } from "svelte";
    import type { ImageReference } from "../lib/models";
    import { getImage } from "../lib/db";

    export let pictures: ImageReference[] = [];
    export let pictureUrls: Record<string, string> | undefined = undefined;

    let internalPictureUrls: Record<string, string> = {};
    let blobUrls: string[] = [];
    let loadToken = 0;
    let urls: Record<string, string> = {};
    let selectedIndex: number | null = null;

    $: validPictures = pictures.filter(
        (pic) => typeof pic?.id === "string" && pic.id.trim().length > 0,
    );
    $: visiblePictures = validPictures.filter((picture) => urls[picture.id]);
    $: selectedPicture =
        selectedIndex === null ? undefined : visiblePictures[selectedIndex];
    $: selectedUrl = selectedPicture ? urls[selectedPicture.id] : undefined;

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
                internalPictureUrls[picture.id] = url;
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

    function closeLightbox() {
        selectedIndex = null;
    }

    function showPreviousImage() {
        if (selectedIndex === null || visiblePictures.length === 0) return;
        selectedIndex =
            (selectedIndex - 1 + visiblePictures.length) %
            visiblePictures.length;
    }

    function showNextImage() {
        if (selectedIndex === null || visiblePictures.length === 0) return;
        selectedIndex = (selectedIndex + 1) % visiblePictures.length;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (selectedIndex === null) return;

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowLeft") {
            showPreviousImage();
        } else if (event.key === "ArrowRight") {
            showNextImage();
        }
    }

    $: if (pictureUrls === undefined && pictures.length > 0) {
        loadInternalUrls();
    }

    $: urls = pictureUrls ?? internalPictureUrls;

    $: if (
        selectedIndex !== null &&
        (selectedIndex >= visiblePictures.length ||
            visiblePictures.length === 0)
    ) {
        closeLightbox();
    }

    onDestroy(() => {
        cleanupBlobUrls();
    });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if visiblePictures.length > 0}
    <div class="picture-grid">
        {#each visiblePictures as picture, index}
            <button
                class="picture-thumb"
                type="button"
                aria-label="Gerätebild groß anzeigen"
                on:click={() => openLightbox(index)}
            >
                <img
                    src={urls[picture.id]}
                    alt="Gerätebild"
                    width="64"
                    height="64"
                />
            </button>
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
            on:click={closeLightbox}
        >
            ×
        </button>

        {#if visiblePictures.length > 1}
            <button
                class="lightbox-nav lightbox-nav-previous"
                type="button"
                aria-label="Vorheriges Bild anzeigen"
                on:click={showPreviousImage}
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
                on:click={showNextImage}
            >
                ›
            </button>
        {/if}
    </div>
{/if}

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
