import { ImageReference } from "./ImageReference";
import { Inspection } from "./Inspection";

export class Device {
    type = "";
    manufacturer = "";
    model = "";
    serialNumber = "";
    protectionClass = "";
    ratedVoltage = 0;
    ratedPower = 0;
    inspection = true
    deactivated = false;

    pictures: ImageReference[] = [];
    inspections: Inspection[] = [];

    constructor(data?: Partial<Device>) {
        if (!data) {
            return;
        }

        const { inspections, ...rest } = data as Partial<Device>;
        Object.assign(this, rest);

        if (inspections) {
            this.inspections = inspections.map((entry) => new Inspection(entry as Partial<Inspection>));
        }
    }
}