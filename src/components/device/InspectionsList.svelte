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
    import { ResultIcon, StatusIcon } from "../icons";

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
    let editingInspection = $state<Inspection | null>(null);

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

    let editingInspectionReadonly = $derived(
        editingInspection ? !isCurrent(editingInspection) : false,
    );

    let showAddButton = $derived(
        aktuellePruefung.length > 0 && !hasCurrentInspection,
    );

    function handleInspectionSaved(updatedDevice: DeviceModel) {
        creating = false;
        editingInspection = null;
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
        <ResultIcon {result} />
    </span>
{/snippet}

{#snippet statusIcon(status: DeviceStatus)}
    <span
        class="status-icon status-icon--{status}"
        role="img"
        aria-label={statusLabels[status]}
        title={statusLabels[status]}
    >
        <StatusIcon {status} />
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
                        role="button"
                        tabindex="0"
                        onclick={() => (editingInspection = insp)}
                        onkeydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                editingInspection = insp;
                            }
                        }}
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

{#if (creating || editingInspection) && recordId != null}
    <InspectionEditor
        {device}
        {recordId}
        inspection={editingInspection}
        readonly={editingInspectionReadonly}
        onSave={handleInspectionSaved}
        onCancel={() => {
            creating = false;
            editingInspection = null;
        }}
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
        cursor: pointer;
    }

    tr.row-odd {
        background: #f4f6f3;
        cursor: pointer;
    }

    tr.current {
        background: #dcf5e3;
        font-weight: 700;
        cursor: pointer;
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
