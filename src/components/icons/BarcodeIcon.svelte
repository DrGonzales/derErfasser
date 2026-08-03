<script lang="ts">
    let { size = 22 }: { size?: number } = $props();
</script>

<svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="8" x2="7" y2="16" />
    <line x1="10" y1="8" x2="10" y2="16" />
    <line x1="13" y1="8" x2="13" y2="16" />
    <line x1="15" y1="8" x2="15" y2="16" />
    <line x1="17" y1="8" x2="17" y2="16" />
</svg>
