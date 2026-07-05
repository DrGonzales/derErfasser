<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords, type StoredRecord } from "../lib/db";
    import { Devices } from "../lib/models";
    import {
        entriesFilter,
        entriesSort,
        type EntriesSortKey,
    } from "../lib/stores/uiStore";

    type Location = {
        locationName?: string;
        building?: string;
        room?: string;
    };

    type EntryRow = {
        location?: Location;
        device: any;
        recordId: number;
    };

    type Column = {
        key: EntriesSortKey;
        label: string;
    };

    let {
        onSelectDevice,
        uploadVersion = 0,
    }: { onSelectDevice?: (item: EntryRow) => void; uploadVersion?: number } =
        $props();

    const columns: Column[] = [
        { key: "manufacturer", label: "Hersteller" },
        { key: "model", label: "Modell" },
        { key: "serialNumber", label: "Seriennummer" },
        { key: "locationName", label: "Location Name" },
        { key: "building", label: "Building" },
        { key: "room", label: "Room" },
    ];

    let entries: EntryRow[] = $state([]);

    async function load() {
        const records: StoredRecord[] = await getRecords();
        const all: EntryRow[] = [];

        for (const r of records) {
            if (r.device) {
                all.push({
                    location: r.location,
                    device: r.device,
                    recordId: r.id,
                });
                continue;
            }

            const devicesRaw: any = (r as any).devices;
            if (!devicesRaw) continue;

            // Backward compatibility: support old records with `devices.entries`.
            const devices = new Devices(devicesRaw as Partial<Devices>);

            if (Array.isArray(devices.entries)) {
                for (const e of devices.entries) {
                    all.push({
                        location: e.location,
                        device: e.device,
                        recordId: r.id,
                    });
                }
            }
        }

        entries = all;
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

    const filtered = $derived(entries.filter((e) => {
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
    }));

    const sorted = $derived([...filtered].sort((a, b) => {
        const direction = $entriesSort.direction === "ascending" ? 1 : -1;
        return (
            getSortValue(a, $entriesSort.key).localeCompare(
                getSortValue(b, $entriesSort.key),
                "de",
                { numeric: true, sensitivity: "base" },
            ) * direction
        );
    }));
</script>

<div class="wrap">
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
        <div class="result-count" aria-live="polite">
            {sorted.length} / {entries.length}
        </div>
    </div>

    <div class="table-shell">
        <table class="entries-table">
            <thead>
                <tr>
                    {#each columns as column (column.key)}
                        <th
                            aria-sort={$entriesSort.key === column.key
                                ? $entriesSort.direction
                                : "none"}
                        >
                            <button
                                class="sort-button"
                                type="button"
                                onclick={() => setSort(column.key)}
                            >
                                <span>{column.label}</span>
                                <span class="sort-indicator" aria-hidden="true">
                                    {$entriesSort.key === column.key
                                        ? $entriesSort.direction === "ascending"
                                            ? "↑"
                                            : "↓"
                                        : ""}
                                </span>
                            </button>
                        </th>
                    {/each}
                    <th>Aktion</th>
                </tr>
            </thead>
            <tbody>
                {#each sorted as item (item.recordId)}
                    <tr>
                        <td>{item.device?.manufacturer ?? "-"}</td>
                        <td>{item.device?.model ?? "-"}</td>
                        <td>{item.device?.serialNumber ?? "-"}</td>
                        <td>{item.location?.locationName ?? "-"}</td>
                        <td>{item.location?.building ?? "-"}</td>
                        <td>{item.location?.room ?? "-"}</td>
                        <td>
                            <button
                                type="button"
                                class="open-button"
                                aria-label="Öffne Gerät"
                                onclick={() => onSelectDevice?.(item)}
                            >
                                Öffnen
                            </button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .wrap {
        max-width: 1000px;
        margin: 1rem auto;
    }

    .toolbar {
        display: flex;
        align-items: end;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .filter-field {
        flex: 1;
        min-width: 16rem;
        display: grid;
        gap: 0.35rem;
        color: #31433b;
        font-weight: 700;
    }

    .filter-field input {
        width: 100%;
        min-height: 44px;
        border: 1px solid #cbd4ca;
        border-radius: 6px;
        padding: 0 13px;
        color: #17211d;
        background: #fbfcfa;
        font: inherit;
        font-weight: 400;
    }

    .filter-field input:focus {
        border-color: #235347;
        outline: 3px solid rgb(35 83 71 / 20%);
    }

    .result-count {
        min-width: 5rem;
        min-height: 44px;
        display: grid;
        align-items: center;
        color: #667970;
        font-weight: 700;
        text-align: right;
        white-space: nowrap;
    }

    .table-shell {
        width: 100%;
        overflow-x: auto;
        border: 1px solid #d8ded4;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 12px 30px rgb(36 51 42 / 8%);
    }

    .entries-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    th,
    td {
        height: 52px;
        padding: 0 16px;
        border-bottom: 1px solid #e7ece4;
        text-align: left;
        white-space: nowrap;
    }

    th {
        color: #40544b;
        font-weight: 800;
        background: #f8faf7;
    }

    tbody tr:hover {
        background: #f8faf7;
    }

    tbody tr:last-child td {
        border-bottom: 0;
    }

    .sort-button {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        min-height: 44px;
        border: 0;
        padding: 0;
        color: inherit;
        background: transparent;
        font: inherit;
        font-weight: 800;
    }

    .sort-button:hover,
    .sort-button:focus-visible {
        color: #235347;
        outline: none;
    }

    .sort-indicator {
        display: inline-grid;
        place-items: center;
        width: 1rem;
        color: #235347;
    }

    .open-button {
        min-height: 36px;
        border: 1px solid #235347;
        border-radius: 6px;
        padding: 0 14px;
        color: #235347;
        background: #fff;
        font: inherit;
        font-weight: 800;
    }

    .open-button:hover,
    .open-button:focus-visible {
        background: rgb(35 83 71 / 8%);
        outline: 2px solid rgb(35 83 71 / 32%);
        outline-offset: 2px;
    }

    @media (max-width: 700px) {
        .toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 0.5rem;
        }

        .filter-field {
            min-width: 0;
        }

        .result-count {
            text-align: left;
        }
    }
</style>
