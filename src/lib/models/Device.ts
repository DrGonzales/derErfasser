import { ImageReference } from "./ImageReference";
import { PdfReference } from "./PdfReference";
import { Inspection } from "./Inspection";

export enum ProtectionClass {
    I = 'I',
    II = 'II',
    III = 'III'
}

export const protectionClassLabels: Record<ProtectionClass, string> = {
    [ProtectionClass.I]: 'Schutzklasse I',
    [ProtectionClass.II]: 'Schutzklasse II',
    [ProtectionClass.III]: 'Schutzklasse III'
};

export interface ProtectionClassInfo {
    kennzeichen: string;
    erforderlichePruefungen: string;
}

export const protectionClassInfo: Record<ProtectionClass, ProtectionClassInfo> = {
    [ProtectionClass.I]: {
        kennzeichen: 'Schutzleiter (PE) vorhanden',
        erforderlichePruefungen: 'Sichtprüfung, Schutzleiterwiderstand, Isolationswiderstand oder Ersatz-/Differenzableitstrom, Schutzleiterstrom, Funktionsprüfung'
    },
    [ProtectionClass.II]: {
        kennzeichen: 'Doppelte/verstärkte Isolierung (kein PE)',
        erforderlichePruefungen: 'Sichtprüfung, Isolationswiderstand oder Ersatz-/Differenzableitstrom, Berührungsstrom, Funktionsprüfung'
    },
    [ProtectionClass.III]: {
        kennzeichen: 'Schutzkleinspannung (SELV/PELV)',
        erforderlichePruefungen: 'Sichtprüfung, ggf. Isolationsmessung, Funktionsprüfung'
    }
};

export class Device {
    type = "";
    manufacturer = "";
    model = "";
    serialNumber = "";
    protectionClass: ProtectionClass | "" = "";
    ratedVoltage = 0;
    ratedPower = 0;
    inspection = true
    deactivated = false;

    pictures: ImageReference[] = [];
    pdfs: PdfReference[] = [];
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