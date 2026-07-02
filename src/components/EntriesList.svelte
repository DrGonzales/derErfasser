<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { getRecords, type StoredRecord } from "../lib/db";

    type Location = {
        locationName?: string;
        building?: string;
        room?: string;
    };

    // entries extracted from all records' devices.entries
    let entries: { location?: Location; device?: any }[] = [];
    let filter = "";
    import { entriesFilter } from "../lib/stores/uiStore";
    export let onSelectDevice: ((device: any) => void) | undefined;
    import { uploadCounter } from "../lib/stores/uploadStore";

    import { Devices } from "../lib/models";

    async function load() {
        const records: StoredRecord[] = await getRecords();
        const all: { location?: Location; device?: any }[] = [];

        for (const r of records) {
            const devicesRaw: any = (r as any).devices;
            if (!devicesRaw) continue;

            // Ensure we have a Devices instance (db.getRecords already hydrates,
            // but we wrap again for safety so model constructors run).
            const devices = new Devices(devicesRaw as Partial<Devices>);

            if (Array.isArray(devices.entries)) {
                for (const e of devices.entries) {
                    // e.location is a Location instance via the DeviceEntry constructor
                    all.push({ location: e.location, device: e.device });
                }
            }
        }

        entries = all;
    }

    onMount(() => {
        load();
        const unsub = entriesFilter.subscribe((v) => {
            filter = v ?? "";
        });
        // ensure unsubscribe on destroy
        onDestroy(() => unsub());
    });

    // reload when the global upload counter changes (signalling a new upload)
    $: if ($uploadCounter) {
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
            on:input={() => entriesFilter.set(filter)}
        />
        <div>{filtered.length} / {entries.length}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Location Name</th>
                <th>Building</th>
                <th>Room</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {#each filtered as item}
                <tr>
                    <td>
                        {item.location?.locationName ?? "-"}
                    </td>
                    <td>{item.location?.building ?? "-"}</td>
                    <td>{item.location?.room ?? "-"}</td>
                    <td>
                        {#if item.device}
                            <button
                                class="link"
                                aria-label="Öffne Gerät"
                                on:click={() =>
                                    onSelectDevice &&
                                    onSelectDevice(item.device)}>🔗</button
                            >
                        {/if}
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
</style>
