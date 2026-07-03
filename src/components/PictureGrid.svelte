<script lang="ts">
    import type { ImageReference } from "../lib/models";

    export let pictures: ImageReference[] = [];
    export let pictureUrls: Record<string, string> = {};
</script>

{#if pictures.length > 0}
    <div class="picture-grid">
        {#each pictures as picture}
            <div class="picture-thumb">
                {#if pictureUrls[picture.id]}
                    <img
                        src={pictureUrls[picture.id]}
                        alt="Gerätebild"
                        width="64"
                        height="64"
                    />
                {:else}
                    <div class="picture-placeholder">?</div>
                {/if}
            </div>
        {/each}
    </div>
{:else}
    <div>Keine Bilder vorhanden.</div>
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
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f8f8;
    }

    .picture-thumb img {
        width: 80px;
        height: 80px;
        object-fit: cover;
    }

    .picture-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #777;
        font-size: 1rem;
    }
</style>
