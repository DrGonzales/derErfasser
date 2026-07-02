<script lang="ts">
    import type { Device as DeviceModel } from "../lib/models";

    export let device: DeviceModel | null = null;
    export let onBack: (() => void) | undefined;
</script>

{#if device}
    <div class="device-view">
        <button class="back" on:click={() => onBack && onBack()}
            >← Zurück</button
        >

        <h2>Gerät: {device.manufacturer} {device.model}</h2>

        <dl>
            <div>
                <dt>Typ</dt>
                <dd>{device.type}</dd>
            </div>
            <div>
                <dt>Hersteller</dt>
                <dd>{device.manufacturer}</dd>
            </div>
            <div>
                <dt>Modell</dt>
                <dd>{device.model}</dd>
            </div>
            <div>
                <dt>Seriennummer</dt>
                <dd>{device.serialNumber}</dd>
            </div>
            <div>
                <dt>Schutzklasse</dt>
                <dd>{device.protectionClass}</dd>
            </div>
            <div>
                <dt>Nennspannung</dt>
                <dd>{device.ratedVoltage}</dd>
            </div>
            <div>
                <dt>Nennleistung</dt>
                <dd>{device.ratedPower}</dd>
            </div>
        </dl>

        <h3>Inspektionen</h3>
        {#if device.inspections && device.inspections.length > 0}
            <table>
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Status</th>
                        <th>Ergebnis</th>
                    </tr>
                </thead>
                <tbody>
                    {#each device.inspections as insp}
                        <tr>
                            <td>{insp.inspectionDate}</td>
                            <td>{insp.status}</td>
                            <td>{insp.overallResult}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <div>Keine Inspektionen vorhanden.</div>
        {/if}
    </div>
{:else}
    <div>Kein Gerät ausgewählt.</div>
{/if}

<style>
    .back {
        margin-bottom: 0.5rem;
    }
    dl div {
        display: flex;
        gap: 0.5rem;
    }
    dt {
        font-weight: 600;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.5rem;
    }
    th,
    td {
        border: 1px solid #eee;
        padding: 0.35rem;
    }
</style>
