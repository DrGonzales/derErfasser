import { ImageReference } from "./ImageReference";

export class Device {
    type = "";
    manufacturer = "";
    model = "";
    serialNumber = "";
    protectionClass = "";
    ratedVoltage = 0;
    ratedPower = 0;

    pictures: ImageReference[] = [];

    constructor(data?: Partial<Device>) {
        Object.assign(this, data);
    }
}