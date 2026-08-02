<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        variant,
        type = "button",
        disabled = false,
        onclick,
        class: className = "",
        children,
        ...rest
    }: {
        variant: "primary" | "secondary" | "danger";
        type?: "button" | "submit";
        disabled?: boolean;
        onclick?: () => void;
        class?: string;
        children: Snippet;
        [key: string]: unknown;
    } = $props();
</script>

<button {type} class="btn btn--{variant} {className}" {disabled} {onclick} {...rest}>
    {@render children()}
</button>

<style>
    .btn {
        min-height: 40px;
        padding: 0 1.25rem;
        border-radius: 6px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, outline 0.15s;
    }

    .btn--secondary {
        border: 1px solid var(--color-border-input);
        background: #fff;
        color: var(--color-text-strong);
    }

    .btn--secondary:hover:not(:disabled),
    .btn--secondary:focus-visible:not(:disabled) {
        background: var(--color-surface-muted);
        outline: none;
    }

    .btn--primary {
        border: 0;
        background: var(--color-primary);
        color: #fff;
    }

    .btn--primary:hover:not(:disabled),
    .btn--primary:focus-visible:not(:disabled) {
        background: var(--color-primary-hover);
        outline: 2px solid rgb(35 83 71 / 40%);
        outline-offset: 2px;
    }

    .btn--danger {
        border: 1px solid var(--color-danger);
        background: var(--color-danger);
        color: #fff;
    }

    .btn--danger:hover:not(:disabled),
    .btn--danger:focus-visible:not(:disabled) {
        background: var(--color-danger-hover);
        outline: none;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
