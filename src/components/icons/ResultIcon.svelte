<script lang="ts">
    import { InspectionResult } from "../../lib/models";

    let { result, size = 22 }: { result: InspectionResult; size?: number } =
        $props();
</script>

{#if result === InspectionResult.Passed}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 13 9 18 20 6" />
    </svg>
{:else if result === InspectionResult.Failed}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="5" y1="5" x2="19" y2="19" />
        <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
{:else}
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.5-1.5 1-1.5 2.2" />
        <line x1="12" y1="17.5" x2="12" y2="17.6" />
    </svg>
{/if}
