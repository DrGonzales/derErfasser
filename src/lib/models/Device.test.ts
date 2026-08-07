import { describe, expect, it } from 'vitest';
import { Device, ProtectionClass } from './Device';

describe('Device', () => {
	it('übernimmt einen gültigen protectionClass-Wert unverändert', () => {
		const device = new Device({ protectionClass: ProtectionClass.II });

		expect(device.protectionClass).toBe(ProtectionClass.II);
	});

	it('lässt einen leeren protectionClass-Wert unverändert', () => {
		const device = new Device({ protectionClass: '' });

		expect(device.protectionClass).toBe('');
	});

	it('setzt einen ungültigen (z. B. aus alten Freitext-Daten stammenden) protectionClass-Wert auf "" zurück', () => {
		// Vor Einführung des ProtectionClass-Enums war protectionClass ein
		// freies Textfeld; ältere, in IndexedDB gespeicherte Geräte können
		// daher noch einen beliebigen, ungültigen String enthalten.
		const device = new Device({ protectionClass: 'ungueltiger-alt-wert' as ProtectionClass });

		expect(device.protectionClass).toBe('');
	});

	it('lässt Geräte ohne protectionClass-Angabe beim Standardwert', () => {
		const device = new Device({ manufacturer: 'ACME' });

		expect(device.protectionClass).toBe('');
	});
});
