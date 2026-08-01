import { jsPDF } from 'jspdf';
import type { Meta, Device, Location, Inspection } from './models';
import { InspectionResult, deviceStatusLabels } from './models';
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

type TocEntry = {
    title: string;
    page: number;
};

// Hinweistexte (Beschreibung/description) können beliebig lang sein und
// werden daher kleiner als der übrige Fließtext (11pt) dargestellt sowie
// automatisch umgebrochen, damit sie nicht über den rechten Seitenrand
// hinauslaufen.
const HINT_FONT_SIZE = 9;
const HINT_LINE_HEIGHT = 4.5;

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
 * Formatiert einen Messwert inkl. Einheit für die Anzeige im PDF, sofern ein
 * tatsächlicher Wert vorhanden ist. Ist der Wert 0, undefined oder NaN, wird
 * ein leerer String zurückgegeben, damit die entsprechende Tabellenzelle leer
 * bleibt (kein "0 mA" o. ä.), da 0 in der Praxis "nicht gemessen" bedeutet.
 */
function formatOptionalMeasurement(value: number | undefined, unit: string): string {
    if (!value || Number.isNaN(value)) return '';
    return `${formatMeasurementValue(value)} ${unit}`;
}

/**
 * Prüft, ob mindestens einer der vier Messwerte einer Prüfung einen
 * tatsächlichen (von 0 abweichenden) Wert hat. Wird verwendet, um die
 * gesamte "Messergebnis"-Sektion im neuen Bericht-Layout auszublenden, wenn
 * keine Messwerte erfasst wurden.
 */
function hasAnyMeasurementValue(inspection: Inspection | undefined): boolean {
    if (!inspection) return false;
    return [
        inspection.touchCurrentMa,
        inspection.substituteLeakageCurrentMa,
        inspection.isolationResistanceMohm,
        inspection.protectiveConductorResistanceOhm,
    ].some((value) => Boolean(value) && !Number.isNaN(value));
}

/**
 * Formatiert ein ISO-Datum ("YYYY-MM-DD", wie in Inspection.inspectionDate
 * gespeichert) für die Anzeige im PDF als "DD.MM.YYYY". Gibt einen leeren
 * String zurück, falls der Wert fehlt oder nicht dem erwarteten Format
 * entspricht.
 */
export function formatInspectionDate(isoDate: string | undefined): string {
    if (!isoDate) return '';
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    const [, year, month, day] = match;
    return `${day}.${month}.${year}`;
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
function addChartsPage(doc: jsPDF, chartSections: ReportChartSection[], toc: TocEntry[]): void {
    if (chartSections.length === 0) return;

    doc.addPage();
    toc.push({ title: 'Übersicht', page: doc.getNumberOfPages() });

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
 * Zeichnet einen Text mit einer Unterstreichungslinie darunter (z. B. für
 * "Standort" oder die Zwischenüberschrift "Messergebnis"). Gibt die
 * y-Position unterhalb des unterstrichenen Texts zurück.
 */
function drawUnderlinedText(doc: jsPDF, x: number, y: number, text: string): number {
    doc.text(text, x, y);
    const textWidth = doc.getTextWidth(text);
    const underlineY = y + 1;
    doc.line(x, underlineY, x + textWidth, underlineY);
    return y;
}

/**
 * Zeichnet ein Ergebnis-Symbol (statt Text) zentriert um den angegebenen
 * Mittelpunkt: grüner Haken für "Passed", rotes X für "Failed" und ein
 * grauer Strich für "NoResult" ("nicht nötig"/nicht zutreffend).
 * Die Größe (in mm) kann über den optionalen Parameter `size` angepasst
 * werden, z. B. um das Symbol für das Gesamtergebnis größer darzustellen.
 */
function drawResultSymbol(doc: jsPDF, centerX: number, centerY: number, result: InspectionResult, size = 2.8): void {
    doc.setLineWidth(0.7);

    if (result === InspectionResult.Passed) {
        doc.setDrawColor(resolveColor('var(--color-success)'));
        doc.lines(
            [
                [size * 0.4, size * 0.4],
                [size * 0.9, -size * 1.1],
            ],
            centerX - size * 0.6,
            centerY + size * 0.2,
        );
    } else if (result === InspectionResult.Failed) {
        doc.setDrawColor(resolveColor('var(--color-danger)'));
        doc.line(centerX - size / 2, centerY - size / 2, centerX + size / 2, centerY + size / 2);
        doc.line(centerX + size / 2, centerY - size / 2, centerX - size / 2, centerY + size / 2);
    } else {
        doc.setDrawColor(resolveColor('var(--color-muted)'));
        doc.line(centerX - size / 2, centerY, centerX + size / 2, centerY);
    }

    doc.setDrawColor('#000000');
    doc.setLineWidth(0.2);
}

/**
 * Zeichnet die Info-Tabelle für ein Gerät: 3 Spalten
 * (Seriennummer, Status, Prüfdatum) mit vollem Gitternetz.
 * Zeile 1 = Spaltenüberschriften, Zeile 2 = Werte.
 * Gibt die y-Position unterhalb der Tabelle zurück.
 */
function drawInfoTable(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    device: Device,
    inspection: Inspection | undefined,
): number {
    const colCount = 3;
    const colWidth = width / colCount;
    const headerRowHeight = 7;
    const valueRowHeight = 7;

    const headers = ['Seriennummer', 'Status', 'Prüfdatum'];
    const values = [
        device.serialNumber ?? '',
        inspection ? deviceStatusLabels[inspection.status] : '',
        inspection ? formatInspectionDate(inspection.inspectionDate) : '',
    ];

    const colX = (index: number) => x + index * colWidth;
    const tableBottomY = y + headerRowHeight + valueRowHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    for (let i = 0; i < colCount; i++) {
        doc.text(headers[i], colX(i), y + headerRowHeight / 2 + 1);
    }

    const valueRowY = y + headerRowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (let i = 0; i < colCount; i++) {
        doc.text(values[i], colX(i), valueRowY + valueRowHeight / 2 + 1);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    return tableBottomY;
}

/**
 * Zeichnet die Ergebnis-Tabelle für ein Gerät: 4 Spalten
 * (Sichtprüfung, Funktionsprüfung, Messung, Gesamtergebnis). Überschrift
 * und Ergebnis-Symbol (grüner Haken / rotes X / grauer Strich) stehen dabei
 * in derselben Zeile nebeneinander (Text linksbündig, Symbol rechts davon).
 * "Gesamtergebnis" wird fett dargestellt und erhält ein deutlich größeres
 * Symbol als die übrigen drei Spalten, um das Endresultat hervorzuheben.
 * Gibt die y-Position unterhalb der Tabelle zurück.
 */
function drawResultSymbolsTable(doc: jsPDF, x: number, y: number, width: number, inspection: Inspection | undefined): number {
    const colCount = 4;
    const colWidth = width / colCount;
    const rowHeight = 10;
    const normalSymbolSize = 2.8;
    const overallSymbolSize = normalSymbolSize * 1.4;

    const headers = ['Sichtprüfung', 'Funktionsprüfung', 'Messung', 'Gesamtergebnis'];
    const results: InspectionResult[] = [
        inspection?.visualTestResult ?? InspectionResult.NoResult,
        inspection?.functionTestResult ?? InspectionResult.NoResult,
        inspection?.measurementTestResult ?? InspectionResult.NoResult,
        inspection?.overallResult ?? InspectionResult.NoResult,
    ];

    const colX = (index: number) => x + index * colWidth;
    const textBaselineY = y + rowHeight / 2 + 1;
    const symbolCenterY = y + rowHeight / 2;
    const tableBottomY = y + rowHeight;

    for (let i = 0; i < colCount; i++) {
        const isOverall = i === colCount - 1;

        // Überschrift-Text (linksbündig), "Gesamtergebnis" fett
        doc.setFont('helvetica', isOverall ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.text(headers[i], colX(i), textBaselineY);
        const textWidth = doc.getTextWidth(headers[i]);

        // Ergebnis-Symbol direkt neben dem Text in derselben Zeile
        const symbolSize = isOverall ? overallSymbolSize : normalSymbolSize;
        const symbolCenterX = colX(i) + textWidth + 4 + symbolSize / 2;
        drawResultSymbol(doc, symbolCenterX, symbolCenterY, inspection ? results[i] : InspectionResult.NoResult, symbolSize);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    return tableBottomY;
}

/**
 * Zeichnet die Messergebnis-Tabelle für ein Gerät: 4 Spalten
 * (Berührungsstrom, Ersatzableitstrom, Isolationswiderstand,
 * Schutzleiterwiderstand). Werte, die 0/undefined sind (also nicht
 * gemessen wurden), bleiben als leere Zelle stehen. Diese Funktion wird nur
 * aufgerufen, wenn mindestens ein Messwert vorhanden ist
 * (siehe hasAnyMeasurementValue).
 * Gibt die y-Position unterhalb der Tabelle zurück.
 */
function drawMeasurementTable(doc: jsPDF, x: number, y: number, width: number, inspection: Inspection | undefined): number {
    const colCount = 4;
    const colWidth = width / colCount;
    const headerRowHeight = 7;
    const valueRowHeight = 7;

    const headers = ['Berührungsstrom', 'Ersatzableitstrom', 'Isolationswiderstand', 'Schutzleiterwiderstand'];
    // Hinweis: "Ω" liegt außerhalb der WinAnsi-Kodierung der jsPDF-Standardfonts
    // (helvetica) und würde falsch dargestellt (z. B. als "©"). Daher "Ω" als "Ohm".
    const values = [
        formatOptionalMeasurement(inspection?.touchCurrentMa, 'mA'),
        formatOptionalMeasurement(inspection?.substituteLeakageCurrentMa, 'mA'),
        formatOptionalMeasurement(inspection?.isolationResistanceMohm, 'MOhm'),
        formatOptionalMeasurement(inspection?.protectiveConductorResistanceOhm, 'Ohm'),
    ];

    const colX = (index: number) => x + index * colWidth;
    const centerOf = (index: number) => colX(index) + colWidth / 2;
    const tableBottomY = y + headerRowHeight + valueRowHeight;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    for (let i = 0; i < colCount; i++) {
        doc.text(headers[i], colX(i), y + headerRowHeight / 2 + 1);
    }

    const valueRowY = y + headerRowHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (let i = 0; i < colCount; i++) {
        doc.text(values[i], colX(i), valueRowY + valueRowHeight / 2 + 1);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    return tableBottomY;
}

/**
 * Berechnet die Anzahl der Zeilen, in die ein Hinweistext bei gegebener
 * Breite und Schriftgröße umgebrochen wird. Wird für die
 * Seitenumbruch-Berechnung (blockHeight) benötigt, bevor der Text
 * tatsächlich gezeichnet wird.
 */
function countHintLines(doc: jsPDF, text: string, maxWidth: number): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(HINT_FONT_SIZE);
    return doc.splitTextToSize(text, maxWidth).length;
}

/**
 * Zeichnet den (optionalen) Hinweistext "Hinweis : <description>" mit einer
 * kleineren Schriftgröße als der übrige Fließtext und bricht ihn automatisch
 * innerhalb der verfügbaren Breite um, damit er nicht über den rechten
 * Seitenrand hinausläuft. Gibt die y-Position unterhalb des Textes zurück.
 */
function drawHint(doc: jsPDF, x: number, y: number, maxWidth: number, text: string): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(HINT_FONT_SIZE);
    const lines: string[] = doc.splitTextToSize(`Hinweis : ${text}`, maxWidth);
    for (const line of lines) {
        doc.text(line, x, y);
        y += HINT_LINE_HEIGHT;
    }
    return y;
}

/**
 * Zeichnet eine Ergebnisliste für eine Gruppe von Geräten ("Bestanden",
 * "Nicht bestanden" oder "Kein Ergebnis") mit zentrierter Seitenüberschrift.
 * Jeder Geräte-Block besteht aus:
 *   1. Hersteller - Modell (fett)
 *   2. "Standort : " Standortname - Gebäude - Raum
 *   3. Info-Tabelle: Seriennummer | Status | Prüfdatum
 *   4. Ergebnis-Tabelle: Sichtprüfung | Funktionsprüfung | Messung | Gesamtergebnis,
 *      Ergebnisse als Symbol (grüner Haken / rotes X / grauer Strich)
 *   5. (nur wenn mindestens ein Messwert vorhanden ist) Zwischenüberschrift
 *      "Messergebnis" (unterstrichen) + Messergebnis-Tabelle: Berührungsstrom |
 *      Ersatzableitstrom | Isolationswiderstand | Schutzleiterwiderstand
 *      (Zellen mit Wert 0/nicht gesetzt bleiben leer)
 *   6. (optional, nur wenn description vorhanden) "Hinweis : " description,
 *      in kleinerer Schrift und mit automatischem Zeilenumbruch
 * Zwischen den Geräten wird ein größerer Abstand eingefügt. Geräte werden
 * dabei möglichst nicht über einen Seitenumbruch hinweg getrennt: reicht
 * der verbleibende Platz auf der aktuellen Seite nicht für einen ganzen
 * Block, wird vorher eine neue Seite begonnen. Bleibt devices leer, wird
 * kein zusätzlicher Abschnitt erzeugt.
 */
function addResultsListPage(doc: jsPDF, title: string, devices: ReportDeviceEntry[], toc: TocEntry[]): void {
    if (devices.length === 0) return;

    doc.addPage();
    toc.push({ title, page: doc.getNumberOfPages() });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const marginBottom = 20;
    const lineHeight = 6;
    const blockGap = 12;
    const infoTableHeight = 7 + 7;
    const resultTableHeight = 10;
    const measurementTableHeight = 7 + 7;
    const contentWidth = pageWidth - marginX * 2;

    let y = 20;

    // Seitenüberschrift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 14;

    for (const entry of devices) {
        const { device, location, inspection } = entry;
        const description = inspection?.description?.trim();
        const hasDescription = Boolean(description);
        const hintLines = hasDescription ? countHintLines(doc, description!, contentWidth) : 0;
        const showMeasurements = hasAnyMeasurementValue(inspection);

        // Zeilen: Titel, Standort, Info-Tabelle, Ergebnis-Tabelle,
        // (optional) "Messergebnis"-Überschrift + Messergebnis-Tabelle,
        // (optional) Hinweis-Zeile(n).
        let blockHeight = lineHeight * 2 + infoTableHeight + 4 + resultTableHeight + 4;
        if (showMeasurements) {
            blockHeight += lineHeight + measurementTableHeight + 4;
        }
        blockHeight += hintLines * HINT_LINE_HEIGHT;

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

        // Zeile 2: Standort (ohne Unterstrich)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const locationParts = [location?.locationName, location?.building, location?.room]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        doc.text(`Standort : ${locationParts.join(' - ')}`, marginX, y);
        y += lineHeight;

        // Info-Tabelle: Seriennummer | Status | Prüfdatum
        const tableWidth = pageWidth - marginX * 2;
        y = drawInfoTable(doc, marginX, y, tableWidth, device, inspection);
        y += 4;

        // Ergebnis-Tabelle: Sichtprüfung | Funktionsprüfung | Messung | Gesamtergebnis
        y = drawResultSymbolsTable(doc, marginX, y, tableWidth, inspection);
        y += 4;

        // Messergebnis-Tabelle nur, wenn mindestens ein Messwert vorhanden ist
        if (showMeasurements) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            // drawUnderlinedText(doc, marginX, y, 'Messergebnis');
            // y += lineHeight;

            y = drawMeasurementTable(doc, marginX, y, tableWidth, inspection);
            y += 4;
        }

        // Zeile (optional): Hinweis — kleinere Schrift, automatischer Zeilenumbruch
        if (hasDescription) {
            y = drawHint(doc, marginX, y, contentWidth, description!);
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
 *   4. (optional) "Hinweis : " description, in kleinerer Schrift und mit
 *      automatischem Zeilenumbruch, damit lange Texte nicht über den
 *      rechten Seitenrand hinauslaufen
 * Zwischen den Geräten wird ein größerer Abstand eingefügt. Geräte werden
 * dabei möglichst nicht über einen Seitenumbruch hinweg getrennt. Bleibt
 * devices leer, wird kein zusätzlicher Abschnitt erzeugt.
 */
function addDeviceListPage(doc: jsPDF, title: string, devices: ReportDeviceEntry[], toc: TocEntry[]): void {
    if (devices.length === 0) return;

    doc.addPage();
    toc.push({ title, page: doc.getNumberOfPages() });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const marginBottom = 20;
    const lineHeight = 6;
    const blockGap = 12;
    const contentWidth = pageWidth - marginX * 2;

    let y = 20;

    // Seitenüberschrift
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 14;

    for (const entry of devices) {
        const { device, location, inspection } = entry;
        const description = inspection?.description?.trim();
        const hasDescription = Boolean(description);
        const hintLines = hasDescription ? countHintLines(doc, description!, contentWidth) : 0;
        // Zeilen: Titel, Seriennummer, Standort, (optional) Hinweis-Zeile(n).
        const blockHeight = lineHeight * 3 + hintLines * HINT_LINE_HEIGHT;

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

        // Zeile (optional): Hinweis — kleinere Schrift, automatischer Zeilenumbruch
        if (hasDescription) {
            y = drawHint(doc, marginX, y, contentWidth, description!);
        }

        // Größerer Abstand zwischen den Geräten
        y += blockGap;
    }
}

/**
 * Fügt eine Inhaltsverzeichnis-Seite als neue Seite 2 ein (nach dem Deckblatt,
 * vor der Übersichtsseite) und listet darin alle tatsächlich vorhandenen
 * Berichtsteile (Übersicht, Ergebnislisten, Gerätelisten) mit ihrer jeweiligen
 * Seitenzahl auf. Abschnitte ohne Inhalt (z. B. leere Ergebnislisten) tauchen
 * gar nicht erst in `toc` auf und werden somit auch nicht im Inhaltsverzeichnis
 * aufgeführt. Da das Einfügen der Seite alle nachfolgenden Seiten um eins
 * verschiebt, werden die zuvor gesammelten Seitenzahlen entsprechend korrigiert.
 * Bleibt `toc` leer, wird keine Inhaltsverzeichnis-Seite erzeugt.
 */
function addTableOfContentsPage(doc: jsPDF, toc: TocEntry[]): void {
    if (toc.length === 0) return;

    doc.insertPage(2);
    for (const entry of toc) {
        entry.page += 1;
    }
    doc.setPage(2);

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 20;
    const rightX = pageWidth - marginX;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Inhaltsverzeichnis', pageWidth / 2, y, { align: 'center' });
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    for (const entry of toc) {
        const pageLabel = String(entry.page);
        const pageLabelWidth = doc.getTextWidth(pageLabel);
        const titleWidth = doc.getTextWidth(entry.title);

        doc.text(entry.title, marginX, y);
        doc.text(pageLabel, rightX, y, { align: 'right' });

        // Gepunktete Leitlinie zwischen Titel und Seitenzahl
        const dotsStartX = marginX + titleWidth + 3;
        const dotsEndX = rightX - pageLabelWidth - 3;
        const dotSpacing = 2;
        for (let dotX = dotsStartX; dotX < dotsEndX; dotX += dotSpacing) {
            doc.text('.', dotX, y);
        }

        y += 9;
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
 * Seite 2 (optional): Inhaltsverzeichnis, das alle tatsächlich vorhandenen
 * Berichtsteile mit ihrer jeweiligen Seitenzahl auflistet (fehlt, wenn keiner
 * der übrigen Abschnitte Inhalt hat).
 * Danach (optional): Diagramme Prüfstatus, Prüfergebnis, Gerätezustand.
 * Anschließend (optional): Ergebnislisten "Bestanden", "Nicht bestanden" und
 * "Kein Ergebnis" (mit Ergebnis-Tabelle), sowie Gerätelisten "Nicht auffindbar"
 * und "Außer Betrieb" (ohne Ergebnis-Tabelle). Jede Liste nur, wenn sie
 * Geräte enthält.
 * Jede Seite erhält am Seitenende eine zentrierte Seitenzahl ("Seite X von Y").
 * Weitere Seiten/Abschnitte können hier künftig ergänzt werden, z. B.:
 *
 *   const doc = createDocument();
 *   addCoverPage(doc, meta);
 *   addChartsPage(doc, chartSections, toc);
 *   addResultsListPage(doc, 'Ergebnisse : Bestanden', passedDevices, toc);
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
    const toc: TocEntry[] = [];
    addCoverPage(doc, meta);
    addChartsPage(doc, chartSections, toc);
    addResultsListPage(doc, 'Ergebnisse : Bestanden', passedDevices, toc);
    addResultsListPage(doc, 'Ergebnisse : Nicht bestanden', failedDevices, toc);
    addResultsListPage(doc, 'Ergebnisse : Kein Ergebnis', noResultDevices, toc);
    addDeviceListPage(doc, 'Ergebnisse : Nicht auffindbar', notFoundDevices, toc);
    addDeviceListPage(doc, 'Ergebnisse : Außer Betrieb', outOfServiceDevices, toc);
    addTableOfContentsPage(doc, toc);
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
