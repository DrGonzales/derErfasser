import { writeFile } from 'fs/promises';
import { faker } from '@faker-js/faker';

interface GeneratedInspection {
    isolationResistanceMohm: number;
    touchCurrentMa: number;
    visualTestResult: string;
    measurementTestResult: string;
    functionTestResult: string;
    overallResult: string;
    status: string;
    description: string;
    inspectionDate: string;
}

interface GeneratedEntry {
    location: {
        locationName: string;
        building: string;
        room: string;
    };
    device: {
        id: string;
        type: string;
        manufacturer: string;
        model: string;
        serialNumber: string;
        protectionClass: string;
        ratedVoltage: number;
        ratedPower: number;
        pictures: string[];
        inspections: GeneratedInspection[];
    };
}

interface GeneratedDevicesFile {
    entries: GeneratedEntry[];
    metadata: {
        inspector: string;
        generatedAt: string;
    };
}

function randomResult() {
    return faker.helpers.arrayElement(['passed', 'failed', 'no_result']);
}

function createEntry(): GeneratedEntry {
    return {
        location: {
            locationName: faker.location.city(),
            building: `Building ${faker.string.alpha({ length: 1, casing: 'upper' })}`,
            room: `R-${faker.number.int({ min: 100, max: 999 })}`
        },
        device: {
            id: faker.string.uuid(),
            type: faker.vehicle.type(),
            manufacturer: faker.company.name(),
            model: faker.commerce.productName(),
            serialNumber: faker.string.alphanumeric(12),
            protectionClass: faker.helpers.arrayElement(['I', 'II', 'III']),
            ratedVoltage: faker.number.int({ min: 110, max: 240 }),
            ratedPower: faker.number.int({ min: 50, max: 2000 }),
            pictures: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.alphanumeric(8)),
            inspections: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
                isolationResistanceMohm: faker.number.int({ min: 10, max: 1000 }),
                touchCurrentMa: faker.number.float({ min: 0.01, max: 5, precision: 0.01 }),
                visualTestResult: randomResult(),
                measurementTestResult: randomResult(),
                functionTestResult: randomResult(),
                overallResult: randomResult(),
                status: faker.helpers.arrayElement(['passed', 'failed', 'no_result']),
                description: faker.lorem.sentence(),
                inspectionDate: faker.date.future({ years: 1 }).toISOString().split('T')[0]
            }))
        }
    };
}

async function generate(count: number) {
    const result: GeneratedDevicesFile = {
        entries: Array.from({ length: count }, () => createEntry()),
        metadata: {
            inspector: `${faker.person.firstName()} ${faker.person.lastName()}`,
            generatedAt: new Date().toISOString()
        }
    };

    await writeFile('plan/generated-devices.json', JSON.stringify(result, null, 2), 'utf8');
    console.log(`Generated ${count} devices to plan/generated-devices.json`);
}

const count = Number(process.argv[2] ?? 10);
if (Number.isNaN(count) || count <= 0) {
    console.error('Please provide a positive integer count.');
    process.exit(1);
}

generate(count).catch((error) => {
    console.error(error);
    process.exit(1);
});
