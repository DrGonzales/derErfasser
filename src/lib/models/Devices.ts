import { Device } from "./Device";
import { Metadata } from "./Metadata";
import { Location } from "./Location";

export class DeviceEntry {
    location = new Location();
    device = new Device();
    metadata = new Metadata({});

    constructor(data?: Partial<DeviceEntry>) {
        if (!data) {
            return;
        }

        if (data.location) {
            this.location = new Location(data.location);
        }

        if (data.device) {
            this.device = new Device(data.device);
        }

        if (data.metadata) {
            this.metadata = new Metadata(data.metadata);
        }
    }
}

export class Devices {
    entries: DeviceEntry[] = [];

    constructor(data?: Partial<Devices>) {
        if (!data) {
            return;
        }

        if (data.entries) {
            this.entries = data.entries.map((entry) => new DeviceEntry(entry));
        }
    }
}