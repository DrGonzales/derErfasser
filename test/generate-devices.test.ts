import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Devices } from '../src/lib/models/Devices';
import { Device } from '../src/lib/models/Device';
import { Location } from '../src/lib/models/Location';

function runGenerator(count: number) {
    return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        execFile('node', ['scripts/generate-devices.ts', String(count)], { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

describe('Device JSON generation', () => {
    it('should generate the requested number of devices and hydrate the Devices model', async () => {
        const count = 10000
        await runGenerator(count);

        const file = await readFile('plan/generated-devices.json', 'utf8');
        const rawData = JSON.parse(file) as { entries: Array<Record<string, unknown>>; metadata: Record<string, unknown> };

        expect(rawData).toHaveProperty('entries');
        expect(Array.isArray(rawData.entries)).toBe(true);
        expect(rawData.entries.length).toBe(count);
        expect(rawData).toHaveProperty('metadata');

        const devices = new Devices(rawData);
        expect(devices.entries.length).toBe(count);
        expect(devices.metadata).toBeDefined();

        const firstEntry = devices.entries[0];
        expect(firstEntry.location).toBeInstanceOf(Location);
        expect(firstEntry.device).toBeInstanceOf(Device);
        expect(firstEntry).not.toHaveProperty('metadata');
    });
});
