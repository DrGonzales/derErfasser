<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { getRecords, type StoredRecord } from "../lib/db";

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

    let entries: EntryRow[] = [];
    let filter = "";
    import { entriesFilter } from "../lib/stores/uiStore";
    export let onSelectDevice: ((item: EntryRow) => void) | undefined;
    import { uploadCounter } from "../lib/stores/uploadStore";

    import { Devices } from "../lib/models";

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

    const unsubscribe = entriesFilter.subscribe((v) => {
        filter = v ?? "";
    });

    onDestroy(() => unsubscribe());

    onMount(() => {
        load();
    });

    // reload when the global upload counter changes (signalling a new upload)
    $: if ($uploadCounter) {
        load();
    }

    $: filtered = entries.filter((e) => {
        const loc = e.location ?? {};
        const device = e.device ?? {};
        const q = filter.trim().toLowerCase();
        if (!q) return true;
        return (
            (device.manufacturer ?? "").toLowerCase().includes(q) ||
            (device.model ?? "").toLowerCase().includes(q) ||
            (device.serialNumber ?? "").toLowerCase().includes(q) ||
            (loc.locationName ?? "").toLowerCase().includes(q) ||
            (loc.building ?? "").toLowerCase().includes(q) ||
            (loc.room ?? "").toLowerCase().includes(q)
        );
    });
</script>

<div class="wrap">
    <div class="filter">
        <label for="filter">Filter :</label>
        <input
            id="filter"
            placeholder="z.B. Siemens, Typ 123, SN-456, New Clara"
            bind:value={filter}
            on:input={() => entriesFilter.set(filter)}
        />
        <div>{filtered.length} / {entries.length}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Hersteller</th>
                <th>Modell</th>
                <th>Seriennummer</th>
                <th>Location Name</th>
                <th>Building</th>
                <th>Room</th>
                <th>Aktion</th>
            </tr>
        </thead>
        <tbody>
            {#each filtered as item}
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
                            class="link"
                            aria-label="Öffne Gerät"
                            on:click={() => onSelectDevice?.(item)}
                        >
                            🔗 Öffnen
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .wrap {
        max-width: 900px;
        margin: 1rem auto;
    }
    .filter {
        margin-bottom: 0.5rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
    }
    th,
    td {
        padding: 0.5rem;
        border: 1px solid #eee;
        text-align: left;
    }
    th {
        background: #fafafa;
    }

    button.link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        border: 1px solid #006c5b;
        background: #e9f7f2;
        color: #006c5b;
        border-radius: 4px;
        padding: 0.4rem 0.8rem;
        text-decoration: none;
        font: inherit;
        min-width: 90px;
    }

    button.link:hover,
    button.link:focus {
        background: #d2efe4;
        outline: 2px solid #006c5b;
        outline-offset: 2px;
    }
</style>
