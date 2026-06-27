import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

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
    it('should generate the requested number of devices', async () => {
        const count = 100;
        await runGenerator(count);

        const file = await readFile('plan/generated-devices.json', 'utf8');
        const data = JSON.parse(file) as { entries: Array<Record<string, unknown>> };

        expect(data).toHaveProperty('entries');
        expect(Array.isArray(data.entries)).toBe(true);
        expect(data.entries.length).toBe(count);

        const first = data.entries[0];
        expect(first).toHaveProperty('location');
        expect(first).toHaveProperty('device');
        expect(first).toHaveProperty('metadata');
        expect(first.device).toHaveProperty('inspections');
    });
});
