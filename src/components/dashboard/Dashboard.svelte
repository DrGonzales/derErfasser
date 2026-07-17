<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords, getMeta } from "../../lib/db";
    import {
        InspectionResult,
        DeviceStatus,
        type Device as DeviceModel,
        type Inspection,
        type Location as LocationModel,
    } from "../../lib/models";
    import { ResultIcon, StatusIcon } from "../icons";
    import DonutChart from "../charts/DonutChart.svelte";
    import ReportButton from "./ReportButton.svelte";
    import type { ReportDeviceEntry } from "../../lib/reportService";

    let { onBack }: { onBack?: () => void } = $props();

    type StatusCounts = Record<DeviceStatus, number>;

    let devices: DeviceModel[] = $state([]);
    let deviceEntries: { device: DeviceModel; location?: LocationModel }[] =
        $state([]);
    let aktuellePruefung = $state("");
    let loaded = $state(false);

    onMount(async () => {
        const [records, meta] = await Promise.all([getRecords(), getMeta()]);
        aktuellePruefung = meta?.aktuellePruefung?.trim() ?? "";
        const recordsWithDevice = records.filter((r) => r.device);
        devices = recordsWithDevice.map((r) => r.device as DeviceModel);
        deviceEntries = recordsWithDevice.map((r) => ({
            device: r.device as DeviceModel,
            location: r.location as LocationModel | undefined,
        }));
        loaded = true;
    });

    function isCurrent(device: DeviceModel): boolean {
        const inspections: Inspection[] = device.inspections ?? [];
        return (
            !aktuellePruefung ||
            inspections.some(
                (ins) => (ins.inspectionName ?? "").trim() === aktuellePruefung,
            )
        );
    }

    function latestInspection(device: DeviceModel): Inspection | undefined {
        const inspections: Inspection[] = device.inspections ?? [];
        if (inspections.length === 0) return undefined;
        return [...inspections].sort((a, b) =>
            (b.inspectionDate ?? "").localeCompare(a.inspectionDate ?? ""),
        )[0];
    }

    function inspectionForCurrentRound(
        device: DeviceModel,
    ): Inspection | undefined {
        const inspections: Inspection[] = device.inspections ?? [];
        if (!aktuellePruefung) return latestInspection(device);
        return inspections.find(
            (ins) => (ins.inspectionName ?? "").trim() === aktuellePruefung,
        );
    }

    const totalCount = $derived(devices.length);

    const deactivatedCount = $derived(
        devices.filter((d) => d.deactivated === true).length,
    );

    const activeDevices = $derived(
        devices.filter((d) => d.deactivated !== true),
    );

    const activeCount = $derived(activeDevices.length);

    const currentCount = $derived(
        activeDevices.filter((d) => isCurrent(d)).length,
    );

    const openCount = $derived(activeCount - currentCount);

    const deactivatedThisRoundCount = $derived.by(() => {
        let count = 0;
        for (const d of devices) {
            const relevant = inspectionForCurrentRound(d);
            if (relevant?.status === DeviceStatus.AusserBetrieb) count += 1;
        }
        return count;
    });

    const pruefstatusSegments = $derived([
        {
            label: "Aktuell geprüft",
            value: currentCount,
            color: "var(--color-success)",
        },
        {
            label: "Offen",
            value: openCount,
            color: "var(--color-warning)",
        },
        {
            label: "Ausgemustert",
            value: deactivatedThisRoundCount,
            color: "var(--color-danger)",
        },
    ]);
    const pruefstatusTotal = $derived(
        currentCount + openCount + deactivatedThisRoundCount,
    );

    const resultCounts = $derived.by(() => {
        const counts: Record<InspectionResult, number> = {
            [InspectionResult.Passed]: 0,
            [InspectionResult.Failed]: 0,
            [InspectionResult.NoResult]: 0,
        };
        for (const d of devices) {
            const relevant = inspectionForCurrentRound(d);
            if (!relevant) continue;
            if (relevant.status === DeviceStatus.AusserBetrieb) continue;
            counts[relevant.overallResult] += 1;
        }
        return counts;
    });

    const statusCounts = $derived.by((): StatusCounts => {
        const counts: StatusCounts = {
            [DeviceStatus.Vorhanden]: 0,
            [DeviceStatus.Defekt]: 0,
            [DeviceStatus.AusserBetrieb]: 0,
            [DeviceStatus.NichtAuffindbar]: 0,
        };
        for (const d of devices) {
            const relevant = inspectionForCurrentRound(d);
            if (!relevant) continue;
            counts[relevant.status] += 1;
        }
        return counts;
    });

    const resultSegments = $derived([
        {
            label: "Bestanden",
            value: resultCounts[InspectionResult.Passed],
            color: "var(--color-success)",
        },
        {
            label: "Nicht bestanden",
            value: resultCounts[InspectionResult.Failed],
            color: "var(--color-danger)",
        },
        {
            label: "Kein Ergebnis",
            value: resultCounts[InspectionResult.NoResult],
            color: "var(--color-warning)",
        },
    ]);
    const resultTotal = $derived(
        resultCounts[InspectionResult.Passed] +
            resultCounts[InspectionResult.Failed] +
            resultCounts[InspectionResult.NoResult],
    );

    const statusSegments = $derived([
        {
            label: "Vorhanden",
            value: statusCounts[DeviceStatus.Vorhanden],
            color: "var(--color-success)",
        },
        {
            label: "Defekt",
            value: statusCounts[DeviceStatus.Defekt],
            color: "var(--color-danger)",
        },
        {
            label: "Außer Betrieb",
            value: statusCounts[DeviceStatus.AusserBetrieb],
            color: "var(--color-muted)",
        },
        {
            label: "Nicht auffindbar",
            value: statusCounts[DeviceStatus.NichtAuffindbar],
            color: "var(--color-warning)",
        },
    ]);
    const statusTotal = $derived(
        statusCounts[DeviceStatus.Vorhanden] +
            statusCounts[DeviceStatus.Defekt] +
            statusCounts[DeviceStatus.AusserBetrieb] +
            statusCounts[DeviceStatus.NichtAuffindbar],
    );

    const chartSections = $derived([
        {
            title: "Prüfstatus",
            segments: pruefstatusSegments,
            total: pruefstatusTotal,
        },
        {
            title: "Prüfergebnis",
            segments: resultSegments,
            total: resultTotal,
        },
        {
            title: "Gerätezustand",
            segments: statusSegments,
            total: statusTotal,
        },
    ]);

    // Geräte gruppiert nach dem Gesamtergebnis ihrer Inspection für die aktuelle
    // Prüfung (für die Ergebnislisten ab Seite 3 des PDF-Berichts). Die passende
    // Inspection wird mitgegeben, damit der Bericht auch die Prüfdetails anzeigen kann.
    // Nur Geräte mit Zustand "Vorhanden" oder "Defekt" werden gelistet.
    function devicesByResult(result: InspectionResult): ReportDeviceEntry[] {
        return deviceEntries.flatMap((entry): ReportDeviceEntry[] => {
            const inspections: Inspection[] = entry.device.inspections ?? [];
            const inspection = inspections.find(
                (ins) =>
                    (ins.inspectionName ?? "").trim() === aktuellePruefung &&
                    ins.overallResult === result &&
                    (ins.status === DeviceStatus.Vorhanden ||
                        ins.status === DeviceStatus.Defekt),
            );
            if (!inspection) return [];
            return [{ device: entry.device, location: entry.location, inspection }];
        });
    }

    const passedDevices: ReportDeviceEntry[] = $derived(
        devicesByResult(InspectionResult.Passed),
    );
    const failedDevices: ReportDeviceEntry[] = $derived(
        devicesByResult(InspectionResult.Failed),
    );
    const noResultDevices: ReportDeviceEntry[] = $derived(
        devicesByResult(InspectionResult.NoResult),
    );

    // Geräte gruppiert nach ihrem Zustand (unabhängig vom Prüfergebnis) für die
    // aktuelle Prüfung – für die Listen "Nicht auffindbar" und "Außer Betrieb"
    // ab Seite 3 des PDF-Berichts (ohne Ergebnis-Tabelle).
    function devicesByStatus(status: DeviceStatus): ReportDeviceEntry[] {
        return deviceEntries.flatMap((entry): ReportDeviceEntry[] => {
            const inspections: Inspection[] = entry.device.inspections ?? [];
            const inspection = inspections.find(
                (ins) =>
                    (ins.inspectionName ?? "").trim() === aktuellePruefung &&
                    ins.status === status,
            );
            if (!inspection) return [];
            return [{ device: entry.device, location: entry.location, inspection }];
        });
    }

    const notFoundDevices: ReportDeviceEntry[] = $derived(
        devicesByStatus(DeviceStatus.NichtAuffindbar),
    );
    const outOfServiceDevices: ReportDeviceEntry[] = $derived(
        devicesByStatus(DeviceStatus.AusserBetrieb),
    );
</script>

<div class="dashboard-page">
    {#if onBack}
        <button class="back-btn" onclick={onBack}>← Zurück</button>
    {/if}

    <div class="dashboard-header">
        <h2>Dashboard</h2>
        <ReportButton
            {chartSections}
            {passedDevices}
            {failedDevices}
            {noResultDevices}
            {notFoundDevices}
            {outOfServiceDevices}
        />
    </div>

    {#if !loaded}
        <p class="loading-hint">Lädt...</p>
    {:else if totalCount === 0}
        <p class="empty-hint">Keine Gerätedaten vorhanden.</p>
    {:else}
        <div class="dashboard-grid">
            <!-- ── Kachel: Übersicht ─────────────────── -->
            <section class="tile panel-card">
                <h3>Übersicht für {aktuellePruefung || "aktuelle Prüfung"}</h3>
                <div class="stat-row">
                    <div class="stat">
                        <span class="stat-number">{totalCount}</span>
                        <span class="stat-label">Gesamt</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">{activeCount}</span>
                        <span class="stat-label">Aktiv</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">{deactivatedCount}</span>
                        <span class="stat-label">Ausgemustert</span>
                    </div>
                </div>
            </section>

            <!-- ── Kachel: Prüfstatus ─────────────────── -->
            <section class="tile panel-card">
                <h3>Prüfstatus</h3>
                {#if pruefstatusTotal === 0}
                    <p class="tile-empty">Keine Geräte vorhanden.</p>
                {:else}
                    <div class="tile-chart-row">
                        <DonutChart
                            segments={pruefstatusSegments}
                            centerLabel={String(pruefstatusTotal)}
                        />
                        <ul class="stat-list">
                            <li>
                                <span class="dot dot--success"></span>
                                <span class="icon-count">{currentCount}</span>
                                <span class="icon-label">Aktuell geprüft</span
                                >
                            </li>
                            <li>
                                <span class="dot dot--warning"></span>
                                <span class="icon-count">{openCount}</span>
                                <span class="icon-label">Offen</span>
                            </li>
                            <li>
                                <span class="dot dot--danger"></span>
                                <span class="icon-count"
                                    >{deactivatedThisRoundCount}</span
                                >
                                <span class="icon-label">Ausgemustert</span>
                            </li>
                        </ul>
                    </div>
                {/if}
            </section>

            <!-- ── Kachel: Prüfergebnis für aktuelle Prüfung ──── -->
            <section class="tile panel-card">
                <h3>Prüfergebnis</h3>
                <div class="tile-chart-row">
                    <DonutChart
                        segments={resultSegments}
                        centerLabel={String(resultTotal)}
                    />
                    <ul class="stat-list">
                        <li>
                            <span class="icon icon--passed">
                                <ResultIcon
                                    result={InspectionResult.Passed}
                                />
                            </span>
                            <span class="icon-count"
                                >{resultCounts[
                                    InspectionResult.Passed
                                ]}</span
                            >
                            <span class="icon-label">Bestanden</span>
                        </li>
                        <li>
                            <span class="icon icon--failed">
                                <ResultIcon
                                    result={InspectionResult.Failed}
                                />
                            </span>
                            <span class="icon-count"
                                >{resultCounts[
                                    InspectionResult.Failed
                                ]}</span
                            >
                            <span class="icon-label">Nicht bestanden</span>
                        </li>
                        <li>
                            <span class="icon icon--warning">
                                <ResultIcon
                                    result={InspectionResult.NoResult}
                                />
                            </span>
                            <span class="icon-count"
                                >{resultCounts[
                                    InspectionResult.NoResult
                                ]}</span
                            >
                            <span class="icon-label">Kein Ergebnis</span>
                        </li>
                    </ul>
                </div>
            </section>

            <!-- ── Kachel: Gerätezustand ──────────────── -->
            <section class="tile panel-card">
                <h3>Gerätezustand</h3>
                <div class="tile-chart-row">
                    <DonutChart
                        segments={statusSegments}
                        centerLabel={String(statusTotal)}
                    />
                    <ul class="stat-list">
                        <li>
                            <span class="icon icon--passed">
                                <StatusIcon
                                    status={DeviceStatus.Vorhanden}
                                />
                            </span>
                            <span class="icon-count"
                                >{statusCounts[
                                    DeviceStatus.Vorhanden
                                ]}</span
                            >
                            <span class="icon-label">Vorhanden</span>
                        </li>
                        <li>
                            <span class="icon icon--failed">
                                <StatusIcon status={DeviceStatus.Defekt} />
                            </span>
                            <span class="icon-count"
                                >{statusCounts[DeviceStatus.Defekt]}</span
                            >
                            <span class="icon-label">Defekt</span>
                        </li>
                        <li>
                            <span class="icon icon--muted">
                                <StatusIcon
                                    status={DeviceStatus.AusserBetrieb}
                                />
                            </span>
                            <span class="icon-count"
                                >{statusCounts[
                                    DeviceStatus.AusserBetrieb
                                ]}</span
                            >
                            <span class="icon-label">Außer Betrieb</span>
                        </li>
                        <li>
                            <span class="icon icon--warning">
                                <StatusIcon
                                    status={DeviceStatus.NichtAuffindbar}
                                />
                            </span>
                            <span class="icon-count"
                                >{statusCounts[
                                    DeviceStatus.NichtAuffindbar
                                ]}</span
                            >
                            <span class="icon-label">Nicht auffindbar</span>
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    .dashboard-page {
        max-width: 600px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .back-btn {
        background: none;
        border: none;
        color: var(--color-primary);
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        display: block;
        padding: 0;
    }

    .back-btn:hover {
        text-decoration: underline;
    }

    h2 {
        margin-top: 0;
    }

    .dashboard-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .dashboard-header h2 {
        margin-bottom: 0;
    }

    .loading-hint {
        color: var(--color-muted);
        font-size: 0.9rem;
    }

    .empty-hint {
        background: #fff8e1;
        border-left: 4px solid #f59e0b;
        padding: 0.75rem 1rem;
        border-radius: 0 6px 6px 0;
        color: #78350f;
        margin: 0;
        font-size: 0.9rem;
    }

    /* ── Kachel-Grid ─────────────────────────────── */
    .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        align-items: start;
    }

    .tile {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .tile h3 {
        margin: 0;
        color: var(--color-primary);
    }

    .tile-empty {
        color: var(--color-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    /* ── Übersicht / Prüfstatus Stats ─────────────── */
    .stat-row {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .stat {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
    }

    .stat-number {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--color-text);
        line-height: 1;
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--color-muted);
        font-weight: 600;
    }

    /* ── Donut-Chart + Legende nebeneinander ──────── */
    .tile-chart-row {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
    }

    /* ── Ergebnis- / Zustands-Listen ──────────────── */
    .stat-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
    }

    .stat-list li {
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }

    .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .icon--passed {
        color: var(--color-success);
    }

    .icon--failed {
        color: var(--color-danger);
    }

    .icon--warning {
        color: var(--color-warning);
    }

    .icon--muted {
        color: var(--color-muted);
    }

    .dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .dot--success {
        background: var(--color-success);
    }

    .dot--warning {
        background: var(--color-warning);
    }

    .dot--danger {
        background: var(--color-danger);
    }

    .icon-count {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--color-text);
        min-width: 1.6rem;
        text-align: right;
    }

    .icon-label {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
    }
</style>
