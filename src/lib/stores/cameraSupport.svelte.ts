// Prüft einmalig beim Start der App, ob das Gerät voraussichtlich eine
// Kamera besitzt, mit der ein Barcode-Scan (siehe BarcodeScannerModal.svelte)
// möglich ist. Es wird bewusst nur die MediaDevices-API abgefragt (Liste der
// verfügbaren Video-Eingabegeräte), ohne tatsächlich `getUserMedia`
// aufzurufen — so wird beim App-Start kein Kamera-Berechtigungs-Dialog
// ausgelöst. Der eigentliche Zugriff (inkl. möglicher Berechtigungsabfrage)
// erfolgt erst, wenn der Nutzer den Scan-Dialog öffnet.

let hasCamera = $state<boolean | null>(null); // null = noch nicht geprüft

let initPromise: Promise<void> | null = null;

/**
 * Ermittelt einmalig, ob mindestens ein Video-Eingabegerät (Kamera)
 * vorhanden ist. Nachfolgende Aufrufe liefern denselben, bereits
 * laufenden/abgeschlossenen Promise zurück (keine erneute Abfrage).
 */
export function initCameraSupport(): Promise<void> {
	if (!initPromise) {
		initPromise = (async () => {
			try {
				if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
					hasCamera = false;
					return;
				}

				const devices = await navigator.mediaDevices.enumerateDevices();
				hasCamera = devices.some((device) => device.kind === 'videoinput');
			} catch {
				// z. B. wenn enumerateDevices in dieser Umgebung nicht erlaubt ist
				// (unsicherer Kontext, ältere Browser) — dann gilt: keine Kamera.
				hasCamera = false;
			}
		})();
	}

	return initPromise;
}

export const cameraSupport = {
	get hasCamera() {
		return hasCamera;
	}
};
