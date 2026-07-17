/**
 * Löst im Browser den Download eines Blobs unter dem angegebenen Dateinamen aus.
 * Eigenständiges Modul (statt Teil von zipService.ts), damit Verbraucher, die
 * nur einen Download auslösen wollen (z. B. der PDF-Report), nicht zusätzlich
 * die zip-spezifische Logik (und damit jszip) laden müssen.
 */
export function downloadBlob(blob: Blob, filename: string) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
}
