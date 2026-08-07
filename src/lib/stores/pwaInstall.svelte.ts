// Verwaltet den Installationszustand der App als PWA (Progressive Web App)
// und bietet Hilfsmittel, um dem Nutzer einen passenden Installations-
// Hinweis anzuzeigen (siehe InstallAppTile.svelte im Administrationsbereich).
//
// Chrome/Edge feuern das Event `beforeinstallprompt`, sobald die
// Installierbarkeits-Kriterien erfüllt sind. Dieses Event muss möglichst
// früh abgefangen werden (daher Registrierung bereits beim Modul-Import,
// nicht erst in einer Init-Funktion), da der Browser es sonst automatisch
// verwirft bzw. eine eigene Mini-Infoleiste anzeigt. `preventDefault()`
// unterdrückt diese Standard-UI, damit die App den Zeitpunkt der Anzeige
// selbst steuern kann (über den Button in InstallAppTile.svelte).
//
// Safari (iOS/iPadOS) und Firefox unterstützen `beforeinstallprompt` nicht.
// Dort wird stattdessen eine browserspezifische Anleitung angezeigt (siehe
// `browserKind`).

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type PwaBrowserKind = 'chromium' | 'safari' | 'firefox' | 'other';

let deferredPrompt: BeforeInstallPromptEvent | null = $state(null);
let isInstalled = $state(false);
let browserKind: PwaBrowserKind = $state('other');
let isFirefoxMobile = $state(false);

function detectIsInstalled(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	const standaloneMediaQuery =
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(display-mode: standalone)').matches;

	// iOS Safari kennt kein `display-mode: standalone`-Media-Feature,
	// stattdessen existiert dort `navigator.standalone`.
	const iosStandalone =
		(navigator as Navigator & { standalone?: boolean }).standalone === true;

	return Boolean(standaloneMediaQuery || iosStandalone);
}

function detectBrowserKind(): { kind: PwaBrowserKind; firefoxMobile: boolean } {
	if (typeof navigator === 'undefined') {
		return { kind: 'other', firefoxMobile: false };
	}

	const ua = navigator.userAgent;

	// Reihenfolge ist wichtig: Edge/Chrome enthalten "Safari" im UA-String,
	// daher zuerst auf die spezifischeren Browserkennungen prüfen.
	const isFirefox = /Firefox/i.test(ua);
	const isChromium = /Chrome|Chromium|Edg\//i.test(ua) && !isFirefox;
	const isSafari = /Safari/i.test(ua) && !isChromium && !isFirefox;

	if (isFirefox) {
		const isMobile = /Mobile|Android/i.test(ua);
		return { kind: 'firefox', firefoxMobile: isMobile };
	}

	if (isChromium) {
		return { kind: 'chromium', firefoxMobile: false };
	}

	if (isSafari) {
		return { kind: 'safari', firefoxMobile: false };
	}

	return { kind: 'other', firefoxMobile: false };
}

if (typeof window !== 'undefined') {
	isInstalled = detectIsInstalled();

	const detected = detectBrowserKind();
	browserKind = detected.kind;
	isFirefoxMobile = detected.firefoxMobile;

	window.addEventListener('beforeinstallprompt', (event) => {
		event.preventDefault();
		deferredPrompt = event as BeforeInstallPromptEvent;
	});

	window.addEventListener('appinstalled', () => {
		isInstalled = true;
		deferredPrompt = null;
	});
}

/**
 * Zeigt den vom Browser bereitgestellten Installations-Dialog an (nur
 * möglich, wenn zuvor `beforeinstallprompt` gefeuert hat, siehe `canPrompt`).
 * Das Event kann nur einmal verwendet werden, daher wird es danach verworfen.
 */
export async function promptInstall(): Promise<void> {
	if (!deferredPrompt) {
		return;
	}

	const promptEvent = deferredPrompt;
	deferredPrompt = null;

	await promptEvent.prompt();
	await promptEvent.userChoice;
}

export const pwaInstall = {
	get isInstalled() {
		return isInstalled;
	},
	get canPrompt() {
		return deferredPrompt !== null;
	},
	get browserKind() {
		return browserKind;
	},
	get isFirefoxMobile() {
		return isFirefoxMobile;
	}
};
