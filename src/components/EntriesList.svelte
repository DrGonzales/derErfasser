<script lang="ts">
    import { onMount } from "svelte";
    import { getRecords, type StoredRecord } from "../lib/db";

    type Location = {
        locationName?: string;
        building?: string;
        room?: string;
    };

    // entries extracted from all records' devices.entries
    let entries: { location?: Location }[] = [];
    let filter = "";

    export let refresh = 0;

    import { Devices } from "../lib/models";

    async function load() {
        const records: StoredRecord[] = await getRecords();
        const all: { location?: Location }[] = [];

        for (const r of records) {
            const devicesRaw: any = (r as any).devices;
            if (!devicesRaw) continue;

            // Ensure we have a Devices instance (db.getRecords already hydrates,
            // but we wrap again for safety so model constructors run).
            const devices = new Devices(devicesRaw as Partial<Devices>);

            if (Array.isArray(devices.entries)) {
                for (const e of devices.entries) {
                    // e.location is a Location instance via the DeviceEntry constructor
                    all.push({ location: e.location });
                }
            }
        }

        entries = all;
    }

    onMount(() => {
        load();
    });

    $: if (refresh) {
        // reload when parent signals a refresh (e.g. after upload)
        load();
    }

    $: filtered = entries.filter((e) => {
        const loc = e.location ?? {};
        const q = filter.trim().toLowerCase();
        if (!q) return true;
        return (
            (loc.locationName ?? "").toLowerCase().includes(q) ||
            (loc.building ?? "").toLowerCase().includes(q) ||
            (loc.room ?? "").toLowerCase().includes(q)
        );
    });
</script>

<div class="wrap">
    <div class="filter">
        <label for="filter">Filter (Location Name, Building, Room):</label>
        <input
            id="filter"
            placeholder="z.B. New Clara oder Building A oder R-843"
            bind:value={filter}
        />
        <div>{filtered.length} / {entries.length}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Location Name</th>
                <th>Building</th>
                <th>Room</th>
            </tr>
        </thead>
        <tbody>
            {#each filtered as item}
                <tr>
                    <td>{item.location?.locationName ?? "-"}</td>
                    <td>{item.location?.building ?? "-"}</td>
                    <td>{item.location?.room ?? "-"}</td>
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
</style>
