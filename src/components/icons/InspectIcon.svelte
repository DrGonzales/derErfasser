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
    <circle cx="10.5" cy="10.5" r="6.5" />
    <line x1="15.3" y1="15.3" x2="21" y2="21" />
    <polyline points="7.5 10.5 9.7 12.7 13.5 8" />
</svg>
