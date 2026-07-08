import { ImageReference } from "./ImageReference";

export enum InspectionResult {
    Passed = 'passed',
    Failed = 'failed',
    NoResult = 'no_result'
}

// Zustand des Geräts zum Zeitpunkt der Prüfung (nicht das Prüfergebnis!)
export enum DeviceStatus {
    Vorhanden = 'vorhanden',
    Defekt = 'defekt',
    AusserBetrieb = 'ausser_betrieb',
    NichtAuffindbar = 'nicht_auffindbar'
}

export const inspectionResultLabels: Record<InspectionResult, string> = {
    [InspectionResult.Passed]: 'Bestanden',
    [InspectionResult.Failed]: 'Nicht bestanden',
    [InspectionResult.NoResult]: 'Kein Ergebnis'
};

export const deviceStatusLabels: Record<DeviceStatus, string> = {
    [DeviceStatus.Vorhanden]: 'Vorhanden',
    [DeviceStatus.Defekt]: 'Defekt',
    [DeviceStatus.AusserBetrieb]: 'Außer Betrieb',
    [DeviceStatus.NichtAuffindbar]: 'Nicht auffindbar'
};

export class Inspection {
    isolationResistanceMohm = 0;
    touchCurrentMa = 0;
    visualTestResult: InspectionResult = InspectionResult.NoResult;
    measurementTestResult: InspectionResult = InspectionResult.NoResult;
    functionTestResult: InspectionResult = InspectionResult.NoResult;
    overallResult: InspectionResult = InspectionResult.NoResult;
    status: DeviceStatus = DeviceStatus.Vorhanden;
    description = '';
    inspectionDate = '';
    inspectionName = '';
    pictures: ImageReference[] = [];


    constructor(data?: Partial<Inspection>) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

