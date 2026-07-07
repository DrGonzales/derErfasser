<script lang="ts">
    import { fade } from 'svelte/transition';

    interface Props {
        onDone: () => void;
    }

    let { onDone }: Props = $props();

    let hidden = $state(false);

    function hide() {
        hidden = true;
    }

    $effect(() => {
        const t = setTimeout(hide, 3000);
        return () => clearTimeout(t);
    });
</script>

{#if !hidden}
    <div
        class="splash"
        out:fade={{ duration: 600 }}
        onoutroend={onDone}
    >
        <h1>Der Erfasser!</h1>
    </div>
{/if}

<style>
    .splash {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background-color: #235347;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    h1 {
        color: #ffffff;
        font-size: clamp(2rem, 8vw, 4rem);
        font-weight: 700;
        letter-spacing: 0.05em;
        margin: 0;
        text-align: center;
        font-family: inherit;
    }
</style>
