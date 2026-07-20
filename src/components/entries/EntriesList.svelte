<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords, getMeta, type StoredRecord } from "../../lib/db";
    import {
        entriesFilter,
        entriesSort,
        entriesStatusFilter,
        type EntriesSortKey,
        type EntriesStatusFilter,
    } from "../../lib/stores/uiStore";
    import DeviceEditor from "../device/DeviceEditor.svelte";
    import InspectionEditor from "../device/InspectionEditor.svelte";
    import BackupButton from "../admin/BackupButton.svelte";

    type Location = {
        locationName?: string;
        building?: string;
        room?: string;
    };

    type EntryRow = {
        location?: Location;
        device: any;
        recordId: number;
        isCurrent: boolean;
    };

    type SortChip = {
        key: EntriesSortKey;
        label: string;
    };

    let {
        onSelectDevice,
        uploadVersion = 0,
    }: { onSelectDevice?: (item: EntryRow) => void; uploadVersion?: number } =
        $props();

    let creating = $state(false);
    let lastBackup = $state<number | undefined>(undefined);
    let aktuellePruefung = $state("");
    let inspectionTarget = $state<EntryRow | null>(null);

    const sortChips: SortChip[] = [
        { key: "manufacturer", label: "Hersteller" },
        { key: "model", label: "Modell" },
        { key: "serialNumber", label: "Seriennummer" },
        { key: "locationName", label: "Standort" },
        { key: "building", label: "Gebäude" },
        { key: "room", label: "Raum" },
    ];

    let entries: EntryRow[] = $state([]);

    async function load() {
        const [records, meta] = await Promise.all([getRecords(), getMeta()]);
        const all: EntryRow[] = [];
        aktuellePruefung = meta?.aktuellePruefung?.trim() ?? "";

        // Datum des letzten Backups aus dem neuesten Record holen
        if (records.length > 0) {
            const newest = records[0];
            const recMeta = (newest as any).metadata;
            const metaTs: number | undefined = recMeta?.lastback ?? undefined;
            // localStorage-Timestamp vom letzten ZIP-Backup
            const lsRaw = localStorage.getItem("der-erfasser-last-backup");
            const lsTs = lsRaw ? Number(lsRaw) : undefined;
            // Den neueren der beiden Werte anzeigen
            if (metaTs && lsTs) {
                lastBackup = Math.max(metaTs, lsTs);
            } else {
                lastBackup = metaTs ?? lsTs;
            }
        } else {
            lastBackup = undefined;
        }

        for (const r of records) {
            if (r.device) {
                const inspections: any[] = (r.device as any).inspections ?? [];
                // isCurrent: aktuellePruefung ist leer ODER mind. eine Inspection hat diesen Namen
                const isCurrent =
                    !aktuellePruefung ||
                    inspections.some(
                        (ins) =>
                            (ins.inspectionName ?? "").trim() ===
                            aktuellePruefung,
                    );
                all.push({
                    location: r.location,
                    device: r.device,
                    recordId: r.id,
                    isCurrent,
                });
            }
        }

        entries = all;
    }

    function findCurrentInspection(item: EntryRow) {
        const inspections: any[] = item.device?.inspections ?? [];
        return (
            inspections.find(
                (ins) => (ins.inspectionName ?? "").trim() === aktuellePruefung,
            ) ?? null
        );
    }

    function openInspectionShortcut(item: EntryRow) {
        inspectionTarget = item;
    }

    function handleInspectionSaved() {
        inspectionTarget = null;
        load();
    }

    function closeInspectionShortcut() {
        inspectionTarget = null;
    }

    function getSortValue(entry: EntryRow, key: EntriesSortKey) {
        const loc = entry.location ?? {};
        const device = entry.device ?? {};

        const values: Record<EntriesSortKey, string> = {
            manufacturer: device.manufacturer ?? "",
            model: device.model ?? "",
            serialNumber: device.serialNumber ?? "",
            locationName: loc.locationName ?? "",
            building: loc.building ?? "",
            room: loc.room ?? "",
        };

        return values[key].toLocaleLowerCase("de");
    }

    function setSort(key: EntriesSortKey) {
        entriesSort.update((current) => ({
            key,
            direction:
                current.key === key && current.direction === "ascending"
                    ? "descending"
                    : "ascending",
        }));
    }

    onMount(() => {
        load();
    });

    // reload when uploadVersion changes (signals a new upload)
    $effect(() => {
        if (uploadVersion > 0) load();
    });

    const filtered = $derived(
        entries.filter((e) => {
            const isDeactivated = e.device?.deactivated === true;

            // Ausgemustert-Filter: nur ausgemusterte Geräte, unabhängig von isCurrent/inspectionName
            if ($entriesStatusFilter === "deactivated") {
                if (!isDeactivated) return false;
                const q = $entriesFilter.trim().toLowerCase();
                if (!q) return true;
                const loc = e.location ?? {};
                const device = e.device ?? {};
                return (
                    (device.manufacturer ?? "").toLowerCase().includes(q) ||
                    (device.model ?? "").toLowerCase().includes(q) ||
                    (device.serialNumber ?? "").toLowerCase().includes(q) ||
                    (loc.locationName ?? "").toLowerCase().includes(q) ||
                    (loc.building ?? "").toLowerCase().includes(q) ||
                    (loc.room ?? "").toLowerCase().includes(q)
                );
            }

            // Ausgemusterte Geräte in allen anderen Ansichten ausblenden
            if (isDeactivated) return false;

            // Status-Filter
            if ($entriesStatusFilter === "current" && !e.isCurrent)
                return false;
            if ($entriesStatusFilter === "outdated" && e.isCurrent)
                return false;

            // Textfilter
            const loc = e.location ?? {};
            const device = e.device ?? {};
            const q = $entriesFilter.trim().toLowerCase();
            if (!q) return true;
            return (
                (device.manufacturer ?? "").toLowerCase().includes(q) ||
                (device.model ?? "").toLowerCase().includes(q) ||
                (device.serialNumber ?? "").toLowerCase().includes(q) ||
                (loc.locationName ?? "").toLowerCase().includes(q) ||
                (loc.building ?? "").toLowerCase().includes(q) ||
                (loc.room ?? "").toLowerCase().includes(q)
            );
        }),
    );

    const sorted = $derived(
        [...filtered].sort((a, b) => {
            const direction = $entriesSort.direction === "ascending" ? 1 : -1;
            return (
                getSortValue(a, $entriesSort.key).localeCompare(
                    getSortValue(b, $entriesSort.key),
                    "de",
                    { numeric: true, sensitivity: "base" },
                ) * direction
            );
        }),
    );

    const MAX_VISIBLE = 250;
    const visible = $derived(sorted.slice(0, MAX_VISIBLE));
    const truncated = $derived(sorted.length > MAX_VISIBLE);
</script>

<div class="wrap">
    <!-- Toolbar -->
    <div class="toolbar">
        <label class="filter-field" for="entries-filter">
            <span>Filter</span>
            <input
                id="entries-filter"
                type="search"
                placeholder="z.B. Siemens, Typ 123, SN-456, New Clara"
                bind:value={$entriesFilter}
            />
        </label>

        <div class="status-chips" role="group" aria-label="Status-Filter">
            <button
                type="button"
                class="chip chip--outdated"
                class:chip--active={$entriesStatusFilter === "outdated"}
                onclick={() => entriesStatusFilter.set("outdated")}
                aria-pressed={$entriesStatusFilter === "outdated"}>Offen</button
            >
            <button
                type="button"
                class="chip chip--current"
                class:chip--active={$entriesStatusFilter === "current"}
                onclick={() => entriesStatusFilter.set("current")}
                aria-pressed={$entriesStatusFilter === "current"}
                >Abgearbeitet</button
            >
            <button
                type="button"
                class="chip chip--all"
                class:chip--active={$entriesStatusFilter === "all"}
                onclick={() => entriesStatusFilter.set("all")}
                aria-pressed={$entriesStatusFilter === "all"}>Alle</button
            >
            <button
                type="button"
                class="chip chip--deactivated"
                class:chip--active={$entriesStatusFilter === "deactivated"}
                onclick={() => entriesStatusFilter.set("deactivated")}
                aria-pressed={$entriesStatusFilter === "deactivated"}
                >Ausgemustert</button
            >
        </div>

        <div class="sort-chips" role="group" aria-label="Sortierung">
            {#each sortChips as chip (chip.key)}
                <button
                    type="button"
                    class="chip"
                    class:chip--active={$entriesSort.key === chip.key}
                    onclick={() => setSort(chip.key)}
                    aria-pressed={$entriesSort.key === chip.key}
                >
                    {chip.label}
                    {#if $entriesSort.key === chip.key}
                        <span class="chip-arrow" aria-hidden="true">
                            {$entriesSort.direction === "ascending" ? "↑" : "↓"}
                        </span>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="result-count" aria-live="polite">
            {sorted.length} / {entries.length}
        </div>

        <div class="header-actions">
            {#if lastBackup}
                <span class="backup-date" title="Datum des letzten Backups">
                    {new Date(lastBackup).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                    })}
                </span>
            {/if}
            <BackupButton onBackupDone={load} />
        </div>
    </div>

    <!-- Card Grid -->
    {#if sorted.length === 0}
        <p class="empty-hint">Keine Einträge gefunden.</p>
    {:else}
        <ul class="card-grid" role="list">
            {#each visible as item (item.recordId)}
                <li class="card panel-card">
                    <button
                        type="button"
                        class="inspect-btn"
                        class:inspect-btn--outdated={!item.isCurrent &&
                            !item.device?.deactivated}
                        class:inspect-btn--deactivated={item.device
                            ?.deactivated}
                        aria-label="Gerät prüfen / öffnen"
                        onclick={() => onSelectDevice?.(item)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="22"
                            height="22"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="5" y="3" width="14" height="18" rx="2" />
                            <path
                                d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V3z"
                            />
                            <polyline points="9 12 11 14 15 10" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                        </svg>
                    </button>

                    <div class="card-body">
                        <h3 class="card-title">
                            {item.device?.manufacturer ?? "–"} — {item.device
                                ?.model ?? "–"}
                        </h3>
                        <dl class="card-details">
                            <div class="detail-row">
                                <dt>Seriennummer</dt>
                                <dd>{item.device?.serialNumber ?? "–"}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>Standort</dt>
                                <dd>{item.location?.locationName ?? "–"}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>Gebäude</dt>
                                <dd>{item.location?.building ?? "–"}</dd>
                            </div>
                            <div class="detail-row">
                                <dt>Raum</dt>
                                <dd>{item.location?.room ?? "–"}</dd>
                            </div>
                        </dl>
                    </div>

                    {#if aktuellePruefung}
                        <button
                            type="button"
                            class="action-btn"
                            class:action-btn--add={!item.isCurrent}
                            class:action-btn--edit={item.isCurrent}
                            aria-label={item.isCurrent
                                ? "Aktuelle Prüfung bearbeiten"
                                : "Neue Prüfung anlegen"}
                            title={item.isCurrent
                                ? "Aktuelle Prüfung bearbeiten"
                                : "Neue Prüfung anlegen"}
                            onclick={() => openInspectionShortcut(item)}
                        >
                            {#if item.isCurrent}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="20"
                                    height="20"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                    />
                                    <path
                                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                    />
                                </svg>
                            {:else}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="22"
                                    height="22"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            {/if}
                        </button>
                    {/if}
                </li>
            {/each}
        </ul>
        {#if truncated}
            <p class="truncate-hint" aria-live="polite">
                Nur die ersten {MAX_VISIBLE} Treffer werden angezeigt — Filter verwenden
                um die Ergebnisse einzugrenzen.
            </p>
        {/if}
    {/if}
</div>

<button
    type="button"
    class="fab"
    aria-label="Neues Gerät erstellen"
    onclick={() => (creating = true)}>+</button
>

{#if creating}
    <DeviceEditor
        onSave={() => {
            creating = false;
            load();
        }}
        onCancel={() => (creating = false)}
    />
{/if}

{#if inspectionTarget}
    <InspectionEditor
        device={inspectionTarget.device}
        recordId={inspectionTarget.recordId}
        inspection={findCurrentInspection(inspectionTarget)}
        readonly={false}
        onSave={handleInspectionSaved}
        onCancel={closeInspectionShortcut}
    />
{/if}

<style>
    /* ── Wrapper ─────────────────────────────────────────── */
    .wrap {
        max-width: 1100px;
        margin: 1rem auto;
    }

    /* ── Toolbar ─────────────────────────────────────────── */
    .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
    }

    .filter-field {
        flex: 1;
        min-width: 14rem;
        display: grid;
        gap: 0.35rem;
        color: var(--color-text-secondary);
        font-weight: 700;
    }

    .filter-field input {
        width: 100%;
        min-height: 44px;
        border: 1px solid var(--color-border-input);
        border-radius: 6px;
        padding: 0 13px;
        color: var(--color-text);
        background: #fbfcfa;
        font: inherit;
        font-weight: 400;
    }

    .filter-field input:focus {
        border-color: var(--color-primary);
        outline: 3px solid var(--focus-ring);
    }

    /* ── Sort chips ──────────────────────────────────────── */
    .sort-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0 0.75rem;
        min-height: 34px;
        border: 1px solid #b8c9b8;
        border-radius: 99px;
        background: #f2f7f2;
        color: var(--color-text-strong);
        font: inherit;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
    }

    .chip:hover,
    .chip:focus-visible {
        border-color: var(--color-primary);
        background: #e4efe6;
        color: var(--color-primary);
        outline: none;
    }

    .chip--active {
        border-color: var(--color-primary);
        background: var(--color-primary);
        color: #fff;
    }

    .chip--active:hover,
    .chip--active:focus-visible {
        background: var(--color-primary-hover);
        color: #fff;
    }

    .chip-arrow {
        font-size: 0.85rem;
    }

    /* ── Status chips ────────────────────────────────────── */
    .status-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
        flex-basis: 100%;
    }

    /* Gelb: Offen */
    .chip--outdated {
        border-color: var(--color-warning);
        background: var(--color-warning-bg);
        color: var(--color-warning);
    }
    .chip--outdated:hover,
    .chip--outdated:focus-visible {
        background: #fde68a;
        outline: none;
    }
    .chip--outdated.chip--active {
        background: var(--color-warning);
        border-color: var(--color-warning);
        color: #fff;
    }
    .chip--outdated.chip--active:hover,
    .chip--outdated.chip--active:focus-visible {
        background: #78350f;
    }

    /* Grün: Abgearbeitet */
    .chip--current {
        border-color: var(--color-primary);
        background: var(--color-surface-muted);
        color: var(--color-primary);
    }
    .chip--current:hover,
    .chip--current:focus-visible {
        background: #e4efe6;
        outline: none;
    }
    .chip--current.chip--active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
    }
    .chip--current.chip--active:hover,
    .chip--current.chip--active:focus-visible {
        background: var(--color-primary-hover);
    }

    /* Weiß: Alle */
    .chip--all {
        border-color: #b8c9b8;
        background: #fff;
        color: var(--color-text-strong);
    }
    .chip--all:hover,
    .chip--all:focus-visible {
        background: #f2f7f2;
        outline: none;
    }
    .chip--all.chip--active {
        background: var(--color-text-strong);
        border-color: var(--color-text-strong);
        color: #fff;
    }
    .chip--all.chip--active:hover,
    .chip--all.chip--active:focus-visible {
        background: var(--color-text-secondary);
    }

    /* Rot: Ausgemustert */
    .chip--deactivated {
        border-color: var(--color-danger);
        background: var(--color-danger-bg);
        color: var(--color-danger);
    }
    .chip--deactivated:hover,
    .chip--deactivated:focus-visible {
        background: #fecaca;
        outline: none;
    }
    .chip--deactivated.chip--active {
        background: var(--color-danger);
        border-color: var(--color-danger);
        color: #fff;
    }
    .chip--deactivated.chip--active:hover,
    .chip--deactivated.chip--active:focus-visible {
        background: #991b1b;
    }

    /* ── Result count ────────────────────────────────────── */
    .result-count {
        min-width: 4.5rem;
        min-height: 34px;
        display: grid;
        align-items: center;
        color: var(--color-muted);
        font-weight: 700;
        text-align: right;
        white-space: nowrap;
        font-size: 0.9rem;
    }

    /* ── Header actions (Backup-Button + Datum) ──────────── */
    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }

    .backup-date {
        color: var(--color-muted);
        font-size: 0.8rem;
        white-space: nowrap;
    }

    /* ── Empty / truncate hint ───────────────────────────── */
    .empty-hint,
    .truncate-hint {
        text-align: center;
        padding: 1rem;
        color: var(--color-muted);
        font-size: 0.9rem;
    }

    .empty-hint {
        padding: 3rem 1rem;
    }

    /* ── Card Grid ───────────────────────────────────────── */
    .card-grid {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    /* ── Single card ─────────────────────────────────────── */
    .card {
        position: relative;
        padding: 0;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        transition:
            box-shadow 0.18s,
            border-color 0.18s;
        overflow: hidden;
    }

    .card:hover {
        border-color: var(--color-primary);
        box-shadow: var(--card-shadow-hover);
    }

    /* ── Inspect button (left, full height) ─────────────── */
    .inspect-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        align-self: stretch;
        border: none;
        border-right: 1.5px solid var(--color-primary);
        border-radius: 0;
        background: var(--color-surface-muted);
        color: var(--color-primary);
        cursor: pointer;
        padding: 0;
        transition:
            background 0.15s,
            color 0.15s;
    }

    .inspect-btn:hover,
    .inspect-btn:focus-visible {
        background: var(--color-primary);
        color: #fff;
        outline: none;
    }

    /* Aktuelle Prüfung fehlt → gelb */
    .inspect-btn--outdated {
        background: var(--color-warning-bg);
        border-right-color: var(--color-warning);
        color: var(--color-warning);
    }

    .inspect-btn--outdated:hover,
    .inspect-btn--outdated:focus-visible {
        background: var(--color-warning);
        color: #fff;
        outline: none;
    }

    /* Ausgemustert (deactivated = true) → rot */
    .inspect-btn--deactivated {
        background: var(--color-danger-bg);
        border-right-color: var(--color-danger);
        color: var(--color-danger);
    }

    .inspect-btn--deactivated:hover,
    .inspect-btn--deactivated:focus-visible {
        background: var(--color-danger);
        color: #fff;
        outline: none;
    }

    /* ── Action button (right, full height) ──────────────── */
    .action-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        align-self: stretch;
        border: none;
        border-left: 1.5px solid var(--color-primary);
        border-radius: 0;
        background: var(--color-surface-muted);
        color: var(--color-primary);
        cursor: pointer;
        padding: 0;
        transition:
            background 0.15s,
            color 0.15s;
    }

    /* Grün: Neue Prüfung anlegen (keine aktuelle Prüfung vorhanden) */
    .action-btn--add {
        background: var(--color-surface-muted);
        border-left-color: var(--color-primary);
        color: var(--color-primary);
    }

    .action-btn--add:hover,
    .action-btn--add:focus-visible {
        background: var(--color-primary);
        color: #fff;
        outline: none;
    }

    /* Gelb: Aktuelle Prüfung bearbeiten */
    .action-btn--edit {
        background: var(--color-warning-bg);
        border-left-color: var(--color-warning);
        color: var(--color-warning);
    }

    .action-btn--edit:hover,
    .action-btn--edit:focus-visible {
        background: var(--color-warning);
        color: #fff;
        outline: none;
    }

    /* ── Card body (rechts vom Button) ──────────────────── */
    .card-body {
        flex: 1;
        min-width: 0;
        padding: 0.75rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    /* ── Card title ──────────────────────────────────────── */
    .card-title {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--color-text);
        line-height: 1.35;
        word-break: break-word;
    }

    /* ── Detail list ─────────────────────────────────────── */
    .card-details {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        font-size: 0.82rem;
    }

    .detail-row {
        display: flex;
        gap: 0.4rem;
        align-items: baseline;
    }

    .card-details dt {
        flex-shrink: 0;
        color: var(--color-muted);
        font-weight: 700;
        min-width: 7rem;
    }

    .card-details dd {
        margin: 0;
        color: var(--color-text-secondary);
        word-break: break-word;
    }

    /* ── Responsive toolbar adjustments ─────────────────── */
    @media (max-width: 600px) {
        .toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 0.6rem;
        }

        .filter-field {
            min-width: 0;
        }

        .result-count {
            text-align: left;
        }

        .sort-chips {
            order: 2;
        }
    }

    /* ── FAB ─────────────────────────────────────────────── */
    .fab {
        position: fixed;
        bottom: 1.75rem;
        right: 1.75rem;
        z-index: 100;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: none;
        background: var(--color-primary);
        color: #fff;
        font-size: 2rem;
        line-height: 1;
        display: grid;
        place-items: center;
        box-shadow: 0 4px 16px rgb(35 83 71 / 35%);
        cursor: pointer;
        transition:
            background 0.15s,
            box-shadow 0.15s,
            transform 0.1s;
    }

    .fab:hover,
    .fab:focus-visible {
        background: var(--color-primary-hover);
        box-shadow: 0 6px 24px rgb(35 83 71 / 50%);
        transform: scale(1.07);
        outline: none;
    }

    .fab:active {
        transform: scale(0.96);
    }
</style>
