<script lang="ts">
    import { DeviceStatus } from "../../lib/models";

    let { status, size = 22 }: { status: DeviceStatus; size?: number } =
        $props();
</script>

{#if status === DeviceStatus.Vorhanden}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <polyline points="8 12.5 11 15.5 16 9" />
    </svg>
{:else if status === DeviceStatus.Defekt}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3 21 19 3 19Z" />
        <line x1="12" y1="9.5" x2="12" y2="13.5" />
        <line x1="12" y1="16.3" x2="12" y2="16.4" />
    </svg>
{:else if status === DeviceStatus.AusserBetrieb}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3v7" />
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    </svg>
{:else}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 21s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z" />
        <circle cx="12" cy="9" r="2.3" />
        <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
    </svg>
{/if}
