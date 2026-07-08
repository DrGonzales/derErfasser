<script lang="ts">
    import type { Device as DeviceModel, Location as LocationModel } from "../../lib/models";

    let {
        device,
        location = null,
    }: {
        device: DeviceModel;
        location?: LocationModel | null;
    } = $props();
</script>

<div class="info-card panel-card">
    <div class="info-column">
        <h3>Gerät</h3>
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
    </div>

    <div class="info-column">
        <h3>Standort</h3>
        {#if location}
            <dl>
                <div>
                    <dt>Standortname</dt>
                    <dd>{location.locationName}</dd>
                </div>
                <div>
                    <dt>Gebäude</dt>
                    <dd>{location.building}</dd>
                </div>
                <div>
                    <dt>Raum</dt>
                    <dd>{location.room}</dd>
                </div>
            </dl>
        {:else}
            <p class="empty">Kein Standort hinterlegt.</p>
        {/if}
    </div>
</div>

<style>
    .info-card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        padding: 1.25rem;
        margin-bottom: 1rem;
    }

    .info-column h3 {
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
        font-weight: 800;
        color: var(--color-text);
    }

    dl {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    dl div {
        display: flex;
        gap: 0.5rem;
    }

    dt {
        flex-shrink: 0;
        min-width: 7rem;
        font-weight: 600;
        color: var(--color-muted);
    }

    dd {
        margin: 0;
    }

    .empty {
        color: var(--color-muted);
        font-size: 0.9rem;
        margin: 0;
    }

    @media (max-width: 600px) {
        .info-card {
            grid-template-columns: 1fr;
        }
    }
</style>
