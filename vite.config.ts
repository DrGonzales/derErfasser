import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
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
  plugins: [svelte()],
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
