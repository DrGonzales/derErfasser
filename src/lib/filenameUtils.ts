/**
 * Gemeinsame Hilfsfunktionen zum Erzeugen von Download-Dateinamen
 * (genutzt von zipService.ts und reportService.ts).
 */

export function sanitizeFilenamePart(name: string): string {
    return name
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '_');
}

export function formatTimestampForFilename(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}
