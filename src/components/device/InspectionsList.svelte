<script lang="ts">
    import { onMount } from "svelte";
    import {
        DeviceStatus,
        InspectionResult,
        deviceStatusLabels,
        inspectionResultLabels,
        type Device as DeviceModel,
        type Inspection,
    } from "../../lib/models";
    import { getMeta } from "../../lib/db";
    import InspectionEditor from "./InspectionEditor.svelte";

    let {
        device,
        recordId = null,
        onDeviceUpdated = undefined,
    }: {
        device: DeviceModel;
        recordId?: number | null;
        onDeviceUpdated?: (updatedDevice: DeviceModel) => void;
    } = $props();

    let inspections = $derived(device.inspections ?? []);
    let creating = $state(false);

    let aktuellePruefung = $state("");

    onMount(async () => {
        const meta = await getMeta();
        aktuellePruefung = meta?.aktuellePruefung?.trim() ?? "";
    });

    let sortedInspections = $derived(
        [...inspections].sort((a, b) =>
            b.inspectionDate.localeCompare(a.inspectionDate),
        ),
    );

    function isCurrent(insp: Inspection) {
        return (
            aktuellePruefung.length > 0 &&
            (insp.inspectionName ?? "").trim() === aktuellePruefung
        );
    }

    let hasCurrentInspection = $derived(
        sortedInspections.some((insp) => isCurrent(insp)),
    );

    let showAddButton = $derived(
        aktuellePruefung.length > 0 && !hasCurrentInspection,
    );

    function handleInspectionSaved(updatedDevice: DeviceModel) {
        creating = false;
        onDeviceUpdated?.(updatedDevice);
    }

    const resultLabels = inspectionResultLabels;
    const statusLabels = deviceStatusLabels;
</script>

{#snippet resultIcon(result: InspectionResult)}
    <span
        class="result-icon result-icon--{result}"
        role="img"
        aria-label={resultLabels[result]}
        title={resultLabels[result]}
    >
        {#if result === InspectionResult.Passed}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="4 13 9 18 20 6" />
            </svg>
        {:else if result === InspectionResult.Failed}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
        {:else}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.5-1.5 1-1.5 2.2" />
                <line x1="12" y1="17.5" x2="12" y2="17.6" />
            </svg>
        {/if}
    </span>
{/snippet}

{#snippet statusIcon(status: DeviceStatus)}
    <span
        class="status-icon status-icon--{status}"
        role="img"
        aria-label={statusLabels[status]}
        title={statusLabels[status]}
    >
        {#if status === DeviceStatus.Vorhanden}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <polyline points="8 12.5 11 15.5 16 9" />
            </svg>
        {:else if status === DeviceStatus.Defekt}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3 21 19 3 19Z" />
                <line x1="12" y1="9.5" x2="12" y2="13.5" />
                <line x1="12" y1="16.3" x2="12" y2="16.4" />
            </svg>
        {:else if status === DeviceStatus.AusserBetrieb}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 3v7" />
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            </svg>
        {:else}
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 21s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z" />
                <circle cx="12" cy="9" r="2.3" />
                <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
            </svg>
        {/if}
    </span>
{/snippet}

<section class="inspections-card panel-card">
    <h3>Inspektionen</h3>

    {#if showAddButton}
        <div class="add-row">
            <button
                class="add-btn"
                type="button"
                aria-label="Neue Inspektion anlegen"
                title="Neue Inspektion anlegen"
                onclick={() => (creating = true)}
            >
                +
            </button>
        </div>
    {/if}

    {#if sortedInspections.length > 0}
        <table>
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Gerätezustand</th>
                    <th>Ergebnis</th>
                </tr>
            </thead>
            <tbody>
                {#each sortedInspections as insp, index (insp.inspectionDate + insp.inspectionName)}
                    <tr
                        class={isCurrent(insp)
                            ? "current"
                            : index % 2 === 0
                              ? "row-even"
                              : "row-odd"}
                    >
                        <td>{insp.inspectionDate}</td>
                        <td>{@render statusIcon(insp.status)}</td>
                        <td>{@render resultIcon(insp.overallResult)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <div class="empty">Keine Inspektionen vorhanden.</div>
    {/if}
</section>

{#if creating && recordId != null}
    <InspectionEditor
        {device}
        {recordId}
        onSave={handleInspectionSaved}
        onCancel={() => (creating = false)}
    />
{/if}

<style>
    .inspections-card {
        padding: 1.25rem;
        margin-bottom: 1rem;
    }

    .inspections-card h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--color-text);
    }

    .add-row {
        display: flex;
        justify-content: center;
        margin: 0.5rem 0 1rem;
    }

    .add-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid var(--color-primary);
        background: var(--color-primary);
        color: #fff;
        font-size: 1.5rem;
        line-height: 1;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .add-btn:hover,
    .add-btn:focus-visible {
        background: var(--color-primary);
        color: #fff;
        outline: none;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
    }

    th,
    td {
        border: 1px solid #eee;
        padding: 0.5rem 0.6rem;
        text-align: left;
    }

    th {
        background: var(--color-surface-muted);
        color: var(--color-primary);
        font-weight: 700;
    }

    tr.row-even {
        background: #fff;
    }

    tr.row-odd {
        background: #f4f6f3;
    }

    tr.current {
        background: #dcf5e3;
        font-weight: 700;
    }

    .empty {
        color: var(--color-muted);
    }

    .result-icon,
    .status-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .result-icon--passed {
        color: var(--color-success);
    }

    .result-icon--failed {
        color: var(--color-danger);
    }

    .result-icon--no_result {
        color: var(--color-warning);
    }

    .status-icon--vorhanden {
        color: var(--color-success);
    }

    .status-icon--defekt {
        color: var(--color-danger);
    }

    .status-icon--ausser_betrieb {
        color: var(--color-muted);
    }

    .status-icon--nicht_auffindbar {
        color: var(--color-warning);
    }
</style>
