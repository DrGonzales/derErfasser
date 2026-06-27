import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

const target = document.getElementById('app');

if (!target) {
  throw new Error('App target element not found.');
}

const app = mount(App, {
  target
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('Service Worker konnte nicht registriert werden:', error);
    });
  });
}

export default app;
