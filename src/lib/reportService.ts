import { jsPDF } from 'jspdf';
import type { Meta, Device, Location, Inspection } from './models';
import { inspectionResultLabels, deviceStatusLabels } from './models';
import { sanitizeFilenamePart, formatTimestampForFilename } from './filenameUtils';
import { renderDonutToDataUrl, type ChartSegment } from './chartRenderer';

export type ReportChartSection = {
    title: string;
    segments: ChartSegment[];
    total: number;
};

export type ReportDeviceEntry = {
    device: Device;
    location?: Location;
    inspection?: Inspection;
};

/**
 * Bildet die im Dashboard verwendeten CSS-Variablen-Farben (z. B. "var(--color-success)")
 * auf konkrete Hex-Werte ab, da diese im PDF (Canvas-Rendering) nicht per CSS aufgelöst werden.
 * Werte entsprechen den Definitionen in src/app.css.
 */
const CSS_COLOR_MAP: Record<string, string> = {
    '--color-primary': '#235347',
    '--color-success': '#16a34a',
    '--color-danger': '#dc2626',
    '--color-warning': '#a16207',
    '--color-muted': '#667970',
    '--color-border': '#d8ded4',
};

export function resolveColor(color: string): string {
    const match = color.match(/var\((--[\w-]+)\)/);
    if (match) {
        return CSS_COLOR_MAP[match[1]] ?? '#667970';
    }
    return color;
}

/**
 * Formatiert einen Messwert für die Anzeige im PDF: rundet auf maximal
 * zwei Nachkommastellen und entfernt überflüssige Nullen (z. B. wegen
 * Floating-Point-Ungenauigkeiten wie 0.30000000000000004 → "0.3").
 */
export function formatMeasurementValue(value: number): string {
    return (Math.round(value * 100) / 100).toString();
}

/**
 * Zeichnet die Deckblatt-/Titelseite des Berichts:
 * - Zentrierte Überschrift "Prüfobjekt" + der eigentliche Prüfobjekt-Name
 * - Darunter zentriert Namen, Anschrift und Ort (je eigene Zeile)
 * - Mit Abstand: "Prüfung: <aktuellePruefung>"
 *
 * Diese Funktion ist bewusst eigenständig gehalten, damit der Bericht
 * später um weitere Abschnitte (z. B. addDeviceListPage, addSummaryPage)
 * erweitert werden kann, ohne diese Kernlogik anzufassen.
 */
function addCoverPage(doc: jsPDF, meta: Meta | undefined): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let y = 25;

    // Überschrift: "Prüfobjekt"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Prüfobjekt', centerX, y, { align: 'center' });
    y += 10;

    // Name des Prüfobjekts selbst (falls vorhanden)
    if (meta?.pruefObjekt?.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(meta.pruefObjekt.trim(), centerX, y, { align: 'center' });
        y += 12;
    } else {
        y += 4;
    }

    // 2. Überschrift-Block: Namen, Anschrift, Ort — je eine zentrierte Zeile
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const addressLines = [meta?.namen, meta?.anschrift, meta?.ort]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v));

    for (const line of addressLines) {
        doc.text(line, centerX, y, { align: 'center' });
        y += 7;
    }

    // Abstand vor dem Prüfungsblock
    y += 12;

    // 1. Überschrift: "Prüfung: " + aktuellePruefung
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const pruefungLabel = `Prüfung: ${meta?.aktuellePruefung?.trim() ?? ''}`.trim();
    doc.text(pruefungLabel, centerX, y, { align: 'center' });
}

/**
 * Zeichnet Seite 2 des Berichts: die drei Dashboard-Diagramme
 * (Prüfstatus, Prüfergebnis, Gerätezustand) vertikal gestapelt,
 * jeweils mit Überschrift, Donut-Chart und Legende (farbiger Punkt + Zahl + Label).
 */
function addChartsPage(doc: jsPDF, chartSections: ReportChartSection[]): void {
    if (chartSections.length === 0) return;

    doc.addPage();

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    const donutSizeMm = 32;
    const donutImageSizePx = 300;
    let y = 20;

    // Seitenüberschrift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Übersicht', pageWidth / 2, y, { align: 'center' });
    y += 14;

    for (const section of chartSections) {
        // Überschrift
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(section.title, marginX, y);
        y += 8;

        const donutTopY = y;
        const donutX = marginX;

        if (section.total > 0) {
            const resolvedSegments = section.segments.map((segment) => ({
                ...segment,
                color: resolveColor(segment.color),
            }));
            const dataUrl = renderDonutToDataUrl(resolvedSegments, section.total, {
                size: donutImageSizePx,
                centerLabel: String(section.total),
            });
            doc.addImage(dataUrl, 'PNG', donutX, donutTopY, donutSizeMm, donutSizeMm);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Keine Daten vorhanden.', donutX, donutTopY + donutSizeMm / 2);
        }

        // Legende rechts neben dem Donut
        const legendX = donutX + donutSizeMm + 12;
        let legendY = donutTopY + 5;
        doc.setFontSize(11);
        for (const segment of section.segments) {
            const dotRadius = 1.6;
            doc.setFillColor(resolveColor(segment.color));
            doc.circle(legendX + dotRadius, legendY - dotRadius / 2, dotRadius, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#17211d');
            const countText = String(segment.value);
            doc.text(countText, legendX + dotRadius * 2 + 4, legendY);

            doc.setFont('helvetica', 'normal');
            const countWidth = doc.getTextWidth(countText);
            doc.text(segment.label, legendX + dotRadius * 2 + 4 + countWidth + 3, legendY);

            legendY += 7;
        }
        doc.setTextColor('#000000');

        y = Math.max(donutTopY + donutSizeMm, legendY) + 14;
    }
}

/**
 * Zeichnet die Ergebnis-Tabelle für ein Gerät: 5 Spalten
 * (Status, Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis) mit
 * vollem Gitternetz. Zeile 1 = Spaltenüberschriften, Zeile 2 = Ergebniswerte
 * (Gesamtergebnis fett). Nur die Messung-Spalte hat zusätzlich Zeile 3
 * (Isolationswiderstand) und Zeile 4 (Berührungsstrom); die anderen
 * Spalten enden nach Zeile 2.
 *
 * Gibt die y-Position unterhalb der Tabelle zurück.
 */
function drawResultsTable(doc: jsPDF, x: number, y: number, width: number, inspection: Inspection | undefined): number {
    const colCount = 5;
    const colWidth = width / colCount;
    const headerRowHeight = 7;
    const resultRowHeight = 7;
    const measurementRowHeight = 6;

    const headers = ['Status', 'Sichtprüfung', 'Funktionsprüfung', 'Messung', 'Gesamtergebnis'];
    const results = [
        inspection ? deviceStatusLabels[inspection.status] : '',
        inspection ? inspectionResultLabels[inspection.visualTestResult] : '',
        inspection ? inspectionResultLabels[inspection.functionTestResult] : '',
        inspection ? inspectionResultLabels[inspection.measurementTestResult] : '',
        inspection ? inspectionResultLabels[inspection.overallResult] : '',
    ];
    // Hinweis: "Ω" liegt außerhalb der WinAnsi-Kodierung der jsPDF-Standardfonts
    // (helvetica) und würde falsch dargestellt (z. B. als "©"). Daher "MΩ" als "MOhm".
    const isolationText = `${formatMeasurementValue(inspection?.isolationResistanceMohm ?? 0)} MOhm`;
    const touchCurrentText = `${formatMeasurementValue(inspection?.touchCurrentMa ?? 0)} mA`;

    const colX = (index: number) => x + index * colWidth;
    const centerOf = (index: number) => colX(index) + colWidth / 2;

    // ── Kopfzeile (5 Zellen) ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    for (let i = 0; i < colCount; i++) {
        doc.rect(colX(i), y, colWidth, headerRowHeight);
        doc.text(headers[i], centerOf(i), y + headerRowHeight / 2 + 1, { align: 'center' });
    }

    // ── Ergebniszeile (5 Zellen, letzte fett) ──
    const resultRowY = y + headerRowHeight;
    for (let i = 0; i < colCount; i++) {
        doc.rect(colX(i), resultRowY, colWidth, resultRowHeight);
        doc.setFont('helvetica', i === colCount - 1 ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.text(results[i], centerOf(i), resultRowY + resultRowHeight / 2 + 1, { align: 'center' });
    }

    // ── Zeile 3 + 4: nur Messung-Spalte ──
    const measurementColIndex = 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const row3Y = resultRowY + resultRowHeight;
    doc.rect(colX(measurementColIndex), row3Y, colWidth, measurementRowHeight);
    doc.text(isolationText, centerOf(measurementColIndex), row3Y + measurementRowHeight / 2 + 1, { align: 'center' });

    const row4Y = row3Y + measurementRowHeight;
    doc.rect(colX(measurementColIndex), row4Y, colWidth, measurementRowHeight);
    doc.text(touchCurrentText, centerOf(measurementColIndex), row4Y + measurementRowHeight / 2 + 1, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    return row4Y + measurementRowHeight;
}

/**
 * Zeichnet eine Ergebnisliste für eine Gruppe von Geräten (z. B. "Bestanden",
 * "Nicht bestanden", "Kein Ergebnis") mit zentrierter Seitenüberschrift.
 * Jeder Geräte-Block besteht aus:
 *   1. Hersteller - Modell (fett)
 *   2. "Seriennummer : " + Seriennummer
 *   3. "Standort : " Standortname - Gebäude - Raum
 *   4. Ergebnis-Tabelle: Status | Sichtprüfung | Funktionsprüfung | Messung | Gesamtergebnis (fett),
 *      darunter die jeweiligen Ergebniswerte; in der Messung-Spalte zusätzlich
 *      Isolationswiderstand (MOhm) und Berührungsstrom (mA)
 *   5. (optional) "Hinweis : " description
 * Zwischen den Geräten wird ein größerer Abstand eingefügt. Geräte werden
 * dabei möglichst nicht über einen Seitenumbruch hinweg getrennt: reicht
 * der verbleibende Platz auf der aktuellen Seite nicht für einen ganzen
 * Block, wird vorher eine neue Seite begonnen. Bleibt devices leer, wird
 * kein zusätzlicher Abschnitt erzeugt.
 */
function addResultsListPage(doc: jsPDF, title: string, devices: ReportDeviceEntry[]): void {
    if (devices.length === 0) return;

    doc.addPage();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const marginBottom = 20;
    const lineHeight = 6;
    const blockGap = 12;
    const tableHeight = 7 + 7 + 6 + 6; // Header + Ergebniszeile + 2 Messwertzeilen

    let y = 20;

    // Seitenüberschrift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 14;

    for (const entry of devices) {
        const { device, location, inspection } = entry;
        const hasDescription = Boolean(inspection?.description?.trim());
        // Zeilen: Titel, Seriennummer, Standort, Tabelle, (optional) Hinweis-Zeile.
        const blockHeight = lineHeight * 3 + tableHeight + (hasDescription ? lineHeight : 0);

        // Neue Seite beginnen, falls der Block nicht mehr vollständig passt,
        // damit ein Gerät nicht über zwei Seiten verteilt wird.
        if (y + blockHeight > pageHeight - marginBottom) {
            doc.addPage();
            y = 20;
        }

        // Zeile 1: Hersteller - Modell (fett)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const titleParts = [device.manufacturer, device.model]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        doc.text(titleParts.join(' - '), marginX, y);
        y += lineHeight;

        // Zeile 2: Seriennummer (normale Schrift)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Seriennummer : ${device.serialNumber ?? ''}`, marginX, y);
        y += lineHeight;

        // Zeile 3: Standort
        const locationParts = [location?.locationName, location?.building, location?.room]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        doc.text(`Standort : ${locationParts.join(' - ')}`, marginX, y);
        y += lineHeight;

        // Ergebnis-Tabelle (Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis)
        const tableWidth = pageWidth - marginX * 2;
        y = drawResultsTable(doc, marginX, y, tableWidth, inspection);
        y += 4 + lineHeight;

        // Zeile (optional): Hinweis
        if (hasDescription) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(`Hinweis : ${inspection!.description.trim()}`, marginX, y);
            y += lineHeight;
        }

        // Größerer Abstand zwischen den Geräten
        y += blockGap;
    }
}

/**
 * Zeichnet eine einfache Geräteliste (ohne Ergebnis-Tabelle) mit zentrierter
 * Seitenüberschrift, z. B. für die Zustände "Nicht auffindbar" oder
 * "Außer Betrieb". Jeder Geräte-Block besteht aus:
 *   1. Hersteller - Modell (fett)
 *   2. "Seriennummer : " + Seriennummer
 *   3. "Standort : " Standortname - Gebäude - Raum
 *   4. (optional) "Hinweis : " description
 * Zwischen den Geräten wird ein größerer Abstand eingefügt. Geräte werden
 * dabei möglichst nicht über einen Seitenumbruch hinweg getrennt. Bleibt
 * devices leer, wird kein zusätzlicher Abschnitt erzeugt.
 */
function addDeviceListPage(doc: jsPDF, title: string, devices: ReportDeviceEntry[]): void {
    if (devices.length === 0) return;

    doc.addPage();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const marginBottom = 20;
    const lineHeight = 6;
    const blockGap = 12;

    let y = 20;

    // Seitenüberschrift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 14;

    for (const entry of devices) {
        const { device, location, inspection } = entry;
        const hasDescription = Boolean(inspection?.description?.trim());
        // Zeilen: Titel, Seriennummer, Standort, (optional) Hinweis-Zeile.
        const blockHeight = lineHeight * (hasDescription ? 4 : 3);

        // Neue Seite beginnen, falls der Block nicht mehr vollständig passt,
        // damit ein Gerät nicht über zwei Seiten verteilt wird.
        if (y + blockHeight > pageHeight - marginBottom) {
            doc.addPage();
            y = 20;
        }

        // Zeile 1: Hersteller - Modell (fett)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const titleParts = [device.manufacturer, device.model]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        doc.text(titleParts.join(' - '), marginX, y);
        y += lineHeight;

        // Zeile 2: Seriennummer (normale Schrift)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`Seriennummer : ${device.serialNumber ?? ''}`, marginX, y);
        y += lineHeight;

        // Zeile 3: Standort
        const locationParts = [location?.locationName, location?.building, location?.room]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        doc.text(`Standort : ${locationParts.join(' - ')}`, marginX, y);
        y += lineHeight;

        // Zeile (optional): Hinweis
        if (hasDescription) {
            doc.text(`Hinweis : ${inspection!.description.trim()}`, marginX, y);
            y += lineHeight;
        }

        // Größerer Abstand zwischen den Geräten
        y += blockGap;
    }
}

/**
 * Fügt auf jeder Seite des Dokuments am Seitenende eine zentrierte
 * Seitenzahl im Format "Seite X von Y" ein. Wird nach der vollständigen
 * Erstellung aller Seiten aufgerufen, damit die Gesamtseitenzahl bekannt ist.
 */
function addPageNumbers(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#667970');
        doc.text(`Seite ${page} von ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.setTextColor('#000000');
}

/**
 * Erzeugt den Prüfbericht als PDF-Blob.
 * Seite 1: Deckblatt mit den Meta-Informationen.
 * Seite 2 (optional): Diagramme Prüfstatus, Prüfergebnis, Gerätezustand.
 * Seite 3+ (optional): Ergebnislisten "Bestanden", "Nicht bestanden" und
 * "Kein Ergebnis" (mit Ergebnis-Tabelle), sowie Gerätelisten "Nicht auffindbar"
 * und "Außer Betrieb" (ohne Ergebnis-Tabelle). Jede Liste nur, wenn sie
 * Geräte enthält.
 * Jede Seite erhält am Seitenende eine zentrierte Seitenzahl ("Seite X von Y").
 * Weitere Seiten/Abschnitte können hier künftig ergänzt werden, z. B.:
 *
 *   const doc = createDocument();
 *   addCoverPage(doc, meta);
 *   addChartsPage(doc, chartSections);
 *   addResultsListPage(doc, 'Ergebnisse : Bestanden', passedDevices);
 *   return doc.output('blob');
 */
export async function createReportPdf(
    meta: Meta | undefined,
    chartSections: ReportChartSection[] = [],
    passedDevices: ReportDeviceEntry[] = [],
    failedDevices: ReportDeviceEntry[] = [],
    noResultDevices: ReportDeviceEntry[] = [],
    notFoundDevices: ReportDeviceEntry[] = [],
    outOfServiceDevices: ReportDeviceEntry[] = [],
): Promise<Blob> {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    addCoverPage(doc, meta);
    addChartsPage(doc, chartSections);
    addResultsListPage(doc, 'Ergebnisse : Bestanden', passedDevices);
    addResultsListPage(doc, 'Ergebnisse : Nicht bestanden', failedDevices);
    addResultsListPage(doc, 'Ergebnisse : Kein Ergebnis', noResultDevices);
    addDeviceListPage(doc, 'Ergebnisse : Nicht auffindbar', notFoundDevices);
    addDeviceListPage(doc, 'Ergebnisse : Außer Betrieb', outOfServiceDevices);
    addPageNumbers(doc);
    return doc.output('blob');
}

/**
 * Baut den Dateinamen für den Bericht-Download.
 * Nutzt meta.pruefObjekt als Basis, gefolgt von Datum und Uhrzeit.
 * Fällt auf einen generischen Namen zurück, falls kein pruefObjekt gesetzt ist.
 */
export function buildReportFilename(pruefObjekt: string | undefined, date: Date = new Date()): string {
    const base = pruefObjekt?.trim() ? sanitizeFilenamePart(pruefObjekt) : 'der-erfasser-bericht';
    return `Bericht_${base}_${formatTimestampForFilename(date)}.pdf`;
}
