import './app.css';
import AppRoot from './AppRoot.svelte';
import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';

const target = document.getElementById('app');

if (!target) {
  throw new Error('App target element not found.');
}

const app = mount(AppRoot, {
  target
});

// Registriert den von vite-plugin-pwa/Workbox generierten Service Worker.
// registerType: 'autoUpdate' (siehe vite.config.ts) sorgt dafür, dass eine
// neue Version automatisch aktiviert wird, sobald der Client wieder online
// ist. `immediate: true` lädt beim nächsten Update automatisch neu.
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('App ist jetzt offline verfügbar.');
  },
  onRegisterError(error) {
    console.error('Service Worker Registrierung fehlgeschlagen:', error);
  }
});

export default app;
