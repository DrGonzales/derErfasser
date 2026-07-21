import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

// jsPDF bringt html2canvas, dompurify und canvg als optionale Abhängigkeiten
// mit, die ausschließlich von doc.html() bzw. doc.addSvgAsImage() benötigt
// werden. Diese App nutzt beide Funktionen nicht (nur text/rect/circle/
// addImage/addPage). Ohne diesen Alias würde Vite dennoch ~230 KB (gzip)
// komplett ungenutzten Code in eigene Chunks bündeln.
const unusedJsPdfOptionalDep = fileURLToPath(
  new URL('./src/lib/stubs/unused-jspdf-optional-dep.ts', import.meta.url)
);

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        id: '/',
        name: 'derErfasser',
        short_name: 'Erfasser',
        description:
          'Offlinefähige App zum Speichern von Daten und Bildern in IndexedDB.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f7f4',
        theme_color: '#235347',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      includeAssets: [],
      workbox: {
        // Erfasst alle Build-Outputs, inkl. dynamisch nachgeladener Chunks
        // (reportService, zipService, filenameUtils, models), damit die
        // App nach dem ersten Laden vollständig offline funktioniert.
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      html2canvas: unusedJsPdfOptionalDep,
      dompurify: unusedJsPdfOptionalDep,
      canvg: unusedJsPdfOptionalDep
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_COMMIT__: JSON.stringify(getGitCommitHash())
  },
  test: {
    environment: 'jsdom'
  }
});
