import { ImageReference } from "./ImageReference";

export enum InspectionResult {
    Passed = 'passed',
    Failed = 'failed',
    NoResult = 'no_result'
}

export class Inspection {
    isolationResistanceMohm = 0;
    touchCurrentMa = 0;
    visualTestResult: InspectionResult = InspectionResult.NoResult;
    measurementTestResult: InspectionResult = InspectionResult.NoResult;
    functionTestResult: InspectionResult = InspectionResult.NoResult;
    overallResult: InspectionResult = InspectionResult.NoResult;
    status: InspectionResult = InspectionResult.NoResult;
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

