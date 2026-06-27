import { Device } from "./Device";
import { Metadata } from "./Metadata";
import { Location } from "./Location";

export class DeviceEntry {
    location = new Location();
    device = new Device();


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

    }
}

export class Devices {
    entries: DeviceEntry[] = [];
    metadata: Metadata | undefined = undefined;
    constructor(data?: Partial<Devices>) {
        if (!data) {
            return;
        }

        if (data.entries) {
            this.entries = data.entries.map((entry) => new DeviceEntry(entry));
        }

        if (data.metadata) {
            this.metadata = new Metadata(data.metadata);
        }
    }
}