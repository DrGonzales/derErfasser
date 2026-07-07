import './app.css';
import AppRoot from './AppRoot.svelte';
import { mount } from 'svelte';

const target = document.getElementById('app');

if (!target) {
  throw new Error('App target element not found.');
}

const app = mount(AppRoot, {
  target
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Vorhandene Session → neue Version bereit
                console.log('Neue Version verfügbar. Seite neu laden für Update.');
              } else {
                // Erstinstallation → App ist jetzt offline verfügbar
                console.log('App ist jetzt offline verfügbar.');
              }
            }
          });
        });
      })
      .catch((error: unknown) => {
        console.error('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}

export default app;
