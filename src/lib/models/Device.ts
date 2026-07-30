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

export interface ProtectionClassMeasurementLimits {
    protectiveConductorResistance: string;
    isolationResistance: string;
    substituteLeakageCurrent: string;
    touchCurrent: string;
}

export const protectionClassMeasurementLimits: Record<ProtectionClass, ProtectionClassMeasurementLimits> = {
    [ProtectionClass.I]: {
        protectiveConductorResistance: '≤ 0,3 Ω (bis 5 m Leitung, danach +0,1 Ω je 7,5 m, max. 1,0 Ω)',
        isolationResistance: '≥ 1 MΩ (500 V DC)',
        substituteLeakageCurrent: '≤ 3,5 mA',
        touchCurrent: '≤ 0,5 mA'
    },
    [ProtectionClass.II]: {
        protectiveConductorResistance: '– (nicht vorhanden)',
        isolationResistance: '≥ 2 MΩ (500 V DC)',
        substituteLeakageCurrent: '≤ 0,5 mA',
        touchCurrent: '≤ 0,5 mA'
    },
    [ProtectionClass.III]: {
        protectiveConductorResistance: '– (nicht vorhanden)',
        isolationResistance: '≥ 0,25 MΩ (250 V DC)',
        substituteLeakageCurrent: '–',
        touchCurrent: '–'
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