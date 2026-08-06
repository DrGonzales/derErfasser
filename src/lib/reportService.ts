import { jsPDF } from 'jspdf';
import type { Meta, Device, Location, Inspection } from './models';
import { InspectionResult, deviceStatusLabels, inspectionResultLabels } from './models';
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

// Farben für das tabellarische Bericht-Layout (Gitternetz + graue
// Kopfzeile + abwechselnd schattierte Zeilen), angelehnt an die
// Bildvorlage aus dem Dashboard.
const TABLE_BORDER_COLOR = resolveColor('var(--color-border)');
const TABLE_HEADER_BG = '#eef1ec';
const TABLE_ALT_ROW_BG = '#f7f9f6';

/**
 * Liefert die Textfarbe für ein Prüfergebnis: grün für "Passed", rot für
 * "Failed" und grau für "NoResult"/nicht zutreffend. Wird sowohl für die
 * einzelnen Prüftypen als auch für das Gesamtergebnis verwendet.
 */
function resultTextColor(result: InspectionResult): string {
    if (result === InspectionResult.Passed) return resolveColor('var(--color-success)');
    if (result === InspectionResult.Failed) return resolveColor('var(--color-danger)');
    return resolveColor('var(--color-muted)');
}

/**
 * Liefert das Ergebnis-Label für eine einzelne Prüftyp-Zeile (Sichtprüfung,
 * Funktionsprüfung, Messung): "OK" / "Nicht OK" / "–", passend zur
 * Bildvorlage. Für das Gesamtergebnis wird stattdessen
 * `inspectionResultLabels` ("Bestanden"/"Nicht bestanden"/"Kein Ergebnis")
 * verwendet.
 */
function shortResultLabel(result: InspectionResult): string {
    if (result === InspectionResult.Passed) return 'OK';
    if (result === InspectionResult.Failed) return 'Nicht OK';
    return '-';
}

// Zeilenabstand (in mm) für mehrzeilige Tabellenzellen (Zeilenumbruch bei
// z. B. langen Gerätenamen, Standortangaben oder Hinweistexten).
const TABLE_CELL_LINE_HEIGHT = 4;
// Innenabstand einer Tabellenzelle (links/rechts sowie oben) in mm.
const TABLE_CELL_PADDING = 2;

type TableCell = {
    text: string;
    bold?: boolean;
    color?: string;
    fontSize?: number;
    /** Erlaubt Zeilenumbruch innerhalb der Zellenbreite (z. B. für lange Gerätenamen). */
    wrap?: boolean;
};

/**
 * Berechnet die Zeilen, in die eine Zelle (bei aktiviertem `wrap`)
 * umgebrochen wird. Ohne `wrap` wird der Text als eine einzige Zeile
 * behandelt (kein automatischer Umbruch, wie bisher).
 */
function wrapCellText(doc: jsPDF, cell: TableCell, colWidth: number): string[] {
    doc.setFont('helvetica', cell.bold ? 'bold' : 'normal');
    doc.setFontSize(cell.fontSize ?? 9);
    if (!cell.wrap) return [cell.text];
    const maxWidth = colWidth - TABLE_CELL_PADDING * 2;
    return doc.splitTextToSize(cell.text, maxWidth);
}

/**
 * Berechnet die benötigte Höhe einer Tabellenzeile anhand der Zelle mit den
 * meisten Umbruchzeilen (bei `wrap: true`), mindestens jedoch `minRowHeight`.
 * Wird sowohl beim tatsächlichen Zeichnen (drawTableRow) als auch vorab zur
 * Seitenumbruch-Berechnung benötigt, damit beide Werte übereinstimmen.
 */
function calculateRowHeight(doc: jsPDF, colWidths: number[], cells: TableCell[], minRowHeight: number): number {
    let maxLines = 1;
    for (let i = 0; i < cells.length; i++) {
        const lines = wrapCellText(doc, cells[i], colWidths[i]);
        maxLines = Math.max(maxLines, lines.length);
    }
    const contentHeight = TABLE_CELL_PADDING + maxLines * TABLE_CELL_LINE_HEIGHT;
    return Math.max(minRowHeight, contentHeight);
}

/**
 * Zeichnet eine einzelne Tabellenzeile mit Gitternetz (Rahmen + senkrechte
 * Trennlinien) und optionaler Hintergrundfüllung. `cells` enthält für jede
 * Spalte den Text sowie optionale Formatierung (fett, Textfarbe, Umbruch).
 * Zellen mit `wrap: true` werden automatisch innerhalb der Spaltenbreite
 * umgebrochen und oben ausgerichtet (weitere Zeilen darunter); die Zeile
 * wird dabei automatisch so hoch gezeichnet, dass auch die längste
 * umgebrochene Zelle vollständig hineinpasst (siehe calculateRowHeight).
 * Gibt die y-Position unterhalb der Zeile zurück.
 */
function drawTableRow(
    doc: jsPDF,
    x: number,
    y: number,
    colWidths: number[],
    minRowHeight: number,
    cells: TableCell[],
    fillColor?: string,
): number {
    const totalWidth = colWidths.reduce((sum, w) => sum + w, 0);
    const rowHeight = calculateRowHeight(doc, colWidths, cells, minRowHeight);

    if (fillColor) {
        doc.setFillColor(fillColor);
        doc.rect(x, y, totalWidth, rowHeight, 'F');
    }

    doc.setDrawColor(TABLE_BORDER_COLOR);
    doc.setLineWidth(0.2);
    doc.rect(x, y, totalWidth, rowHeight, 'S');

    let colX = x;
    for (let i = 0; i < colWidths.length; i++) {
        if (i > 0) {
            doc.line(colX, y, colX, y + rowHeight);
        }

        const cell = cells[i];
        const lines = wrapCellText(doc, cell, colWidths[i]);
        doc.setFont('helvetica', cell.bold ? 'bold' : 'normal');
        doc.setFontSize(cell.fontSize ?? 9);
        doc.setTextColor(cell.color ?? '#000000');

        // Text oben ausgerichtet: erste Zeile knapp unter dem oberen
        // Zellenrand, weitere Zeilen darunter (statt vertikal zentriert),
        // damit mehrzeilige Zellen konsistent mit einzeiligen Nachbarzellen
        // in derselben Zeile ausgerichtet sind.
        let lineY = y + TABLE_CELL_PADDING + TABLE_CELL_LINE_HEIGHT * 0.7;
        for (const line of lines) {
            doc.text(line, colX + TABLE_CELL_PADDING, lineY);
            lineY += TABLE_CELL_LINE_HEIGHT;
        }

        colX += colWidths[i];
    }

    doc.setTextColor('#000000');
    doc.setDrawColor('#000000');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    return y + rowHeight;
}

/**
 * Baut den Anzeigetext für die "Gerät"-Zelle der Kopf-Tabelle: Hersteller
 * und Modell, z. B. "Bosch - Powerbohr". Die Schutzklasse wird in einer
 * eigenen Tabellenspalte dargestellt (siehe drawDeviceInfoTable).
 */
function formatDeviceLabel(device: Device): string {
    const titleParts = [device.manufacturer, device.model]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v));
    return titleParts.join(' - ');
}

/**
 * Zeichnet die Kopf-Tabelle für ein Gerät als 4 Zeilen zu je 3 Spalten:
 *   Zeile 1 (Kopf):   Gerät       | Standort   | Status
 *   Zeile 2 (Werte):  <Werte>
 *   Zeile 3 (Kopf):   Seriennummer | Schutzklasse | Prüfdatum
 *   Zeile 4 (Werte):  <Werte>
 * "Gerät" und "Standort" erlauben Zeilenumbruch (wrap), da diese Texte
 * durch Hersteller/Modell bzw. Standort/Gebäude/Raum länger werden können.
 * Beide Zeilenpaare nutzen dieselben Spaltenbreiten (40 / 35 / 25 %), damit
 * die Spalten optisch untereinanderstehen (Seriennummer unter Gerät,
 * Schutzklasse unter Standort, Prüfdatum unter Status).
 * Gibt die y-Position unterhalb der gesamten Tabelle zurück.
 */
function drawDeviceInfoTable(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    device: Device,
    location: Location | undefined,
    inspection: Inspection | undefined,
): number {
    const colWidths = [width * 0.4, width * 0.35, width * 0.25];
    const rowHeight = 8;

    const locationParts = [location?.locationName, location?.building, location?.room]
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v));

    const protectionClassLabel = device.protectionClass ?? '';

    let currentY = drawTableRow(
        doc,
        x,
        y,
        colWidths,
        rowHeight,
        [
            { text: 'Gerät', bold: true },
            { text: 'Standort', bold: true },
            { text: 'Status', bold: true },
        ],
        TABLE_HEADER_BG,
    );

    currentY = drawTableRow(doc, x, currentY, colWidths, rowHeight, [
        { text: formatDeviceLabel(device), fontSize: 10, wrap: true },
        { text: locationParts.join(' - '), fontSize: 10, wrap: true },
        { text: inspection ? deviceStatusLabels[inspection.status] : '', fontSize: 10 },
    ]);

    currentY = drawTableRow(
        doc,
        x,
        currentY,
        colWidths,
        rowHeight,
        [
            { text: 'Seriennummer', bold: true },
            { text: 'Schutzklasse', bold: true },
            { text: 'Prüfdatum', bold: true },
        ],
        TABLE_HEADER_BG,
    );

    currentY = drawTableRow(doc, x, currentY, colWidths, rowHeight, [
        { text: device.serialNumber ?? '', fontSize: 10 },
        { text: protectionClassLabel, fontSize: 10 },
        { text: inspection ? formatInspectionDate(inspection.inspectionDate) : '', fontSize: 10 },
    ]);

    return currentY;
}

/**
 * Zeichnet die Prüfergebnis-Tabelle für ein Gerät: 2 Spalten
 * (Prüftyp, Ergebnis) mit Kopfzeile, abwechselnd schattierten Zeilen und
 * Gitternetz. Zeilen: Sichtprüfung, Funktionsprüfung, Messung (danach ggf.
 * die eingebettete Messwerte-Tabelle) und Gesamtergebnis. Das Ergebnis wird
 * als Text ("OK" / "Nicht OK" / "-", bzw. für das Gesamtergebnis
 * "Bestanden" / "Nicht bestanden" / "Kein Ergebnis") farbig dargestellt.
 * Ist ein Hinweistext (description) vorhanden, wird nach "Gesamtergebnis"
 * eine zusätzliche Zeile "Hinweis" angefügt, deren Text (mit Zeilenumbruch)
 * über die volle Zeilenbreite läuft, statt in die schmale Ergebnis-Spalte
 * gequetscht zu werden.
 * Gibt die y-Position unterhalb der Tabelle (inkl. ggf. eingebetteter
 * Messwerte-Tabelle sowie der Hinweis-Zeile) zurück.
 */
function drawInspectionResultsTable(
    doc: jsPDF,
    x: number,
    y: number,
    width: number,
    inspection: Inspection | undefined,
    showMeasurements: boolean,
    description?: string,
): number {
    const colWidths = [width * 0.7, width * 0.3];
    const rowHeight = 8;

    const rows: { label: string; result: InspectionResult; isOverall?: boolean; isMeasurement?: boolean }[] = [
        { label: 'Sichtprüfung', result: inspection?.visualTestResult ?? InspectionResult.NoResult },
        { label: 'Funktionsprüfung', result: inspection?.functionTestResult ?? InspectionResult.NoResult },
        { label: 'Messung', result: inspection?.measurementTestResult ?? InspectionResult.NoResult, isMeasurement: true },
        { label: 'Gesamtergebnis', result: inspection?.overallResult ?? InspectionResult.NoResult, isOverall: true },
    ];

    let currentY = drawTableRow(
        doc,
        x,
        y,
        colWidths,
        rowHeight,
        [{ text: 'Prüftyp', bold: true }, { text: 'Ergebnis', bold: true }],
        TABLE_HEADER_BG,
    );

    rows.forEach((row, index) => {
        const resultLabel = row.isOverall ? inspectionResultLabels[row.result] : shortResultLabel(row.result);
        currentY = drawTableRow(
            doc,
            x,
            currentY,
            colWidths,
            rowHeight,
            [
                { text: row.label, bold: row.isOverall, fontSize: 10 },
                { text: inspection ? resultLabel : '-', bold: true, color: resultTextColor(row.result), fontSize: 10 },
            ],
            index % 2 === 1 ? TABLE_ALT_ROW_BG : undefined,
        );

        // Direkt unter der "Messung"-Zeile: eingebettete Messwerte-Tabelle,
        // sofern mindestens ein Messwert vorhanden ist.
        if (row.isMeasurement && showMeasurements) {
            currentY = drawMeasurementTable(doc, x, currentY, width, inspection);
        }
    });

    if (description?.trim()) {
        // "Hinweis"-Zeile: schmale Label-Spalte (wie bei den anderen Zeilen
        // links ausgerichtet), der Hinweistext nimmt aber die gesamte
        // restliche Breite ein (nicht nur die schmale 30%-Ergebnis-Spalte),
        // damit lange Hinweistexte übersichtlicher umbrechen.
        const hintLabelWidth = width * 0.2;
        const hintColWidths = [hintLabelWidth, width - hintLabelWidth];
        currentY = drawTableRow(doc, x, currentY, hintColWidths, rowHeight, [
            { text: 'Hinweis', bold: true, fontSize: 10 },
            { text: description.trim(), fontSize: 9, wrap: true },
        ]);
    }

    return currentY;
}

/**
 * Zeichnet die eingebettete Messwerte-Tabelle unterhalb der "Messung"-Zeile:
 * 4 Spalten (Berührungsstrom, Ersatzableitstrom, Isolationswiderstand,
 * Schutzleiterwiderstand) mit Kopfzeile und Wertezeile. Werte, die
 * 0/undefined sind (also nicht gemessen wurden), bleiben als leere Zelle
 * stehen. Wird nur aufgerufen, wenn mindestens ein Messwert vorhanden ist
 * (siehe hasAnyMeasurementValue).
 * Gibt die y-Position unterhalb der Tabelle zurück.
 */
function drawMeasurementTable(doc: jsPDF, x: number, y: number, width: number, inspection: Inspection | undefined): number {
    const colCount = 4;
    const colWidths = Array(colCount).fill(width / colCount);
    const rowHeight = 8;

    const headers = ['Berührungsstrom', 'Ersatzableitstrom', 'Isolationswiderstand', 'Schutzleiterwiderstand'];
    // Hinweis: "Ω" liegt außerhalb der WinAnsi-Kodierung der jsPDF-Standardfonts
    // (helvetica) und würde falsch dargestellt (z. B. als "©"). Daher "Ω" als "Ohm".
    const values = [
        formatOptionalMeasurement(inspection?.touchCurrentMa, 'mA'),
        formatOptionalMeasurement(inspection?.substituteLeakageCurrentMa, 'mA'),
        formatOptionalMeasurement(inspection?.isolationResistanceMohm, 'MOhm'),
        formatOptionalMeasurement(inspection?.protectiveConductorResistanceOhm, 'Ohm'),
    ];

    let currentY = drawTableRow(
        doc,
        x,
        y,
        colWidths,
        rowHeight,
        headers.map((h) => ({ text: h, bold: true, fontSize: 8 })),
        TABLE_HEADER_BG,
    );

    currentY = drawTableRow(
        doc,
        x,
        currentY,
        colWidths,
        rowHeight,
        values.map((v) => ({ text: v, fontSize: 9 })),
    );

    return currentY;
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
 *   1. Kopf-Tabelle (4 Zeilen zu je 3 Spalten): Gerät | Standort | Status,
 *      darunter Seriennummer | Schutzklasse | Prüfdatum
 *   2. Prüfergebnis-Tabelle: Prüftyp | Ergebnis, mit den Zeilen
 *      Sichtprüfung, Funktionsprüfung, Messung (darunter ggf. die
 *      Messwerte-Tabelle, sofern mindestens ein Messwert vorhanden ist),
 *      Gesamtergebnis und (nur wenn description vorhanden) einer
 *      abschließenden "Hinweis"-Zeile mit automatischem Zeilenumbruch
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
    const blockGap = 12;
    const baseRowHeight = 8;
    const headTableRowCount = 4;
    const resultTableRowCount = 5; // Kopfzeile + 4 Prüftyp-Zeilen
    const measurementTableHeight = baseRowHeight + baseRowHeight;
    const tableWidth = pageWidth - marginX * 2;

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
        const showMeasurements = hasAnyMeasurementValue(inspection);

        // Höhe der Kopf-Tabelle vorab berechnen: Gerät/Standort erlauben
        // Zeilenumbruch, daher kann die Zeilenhöhe je Gerät variieren.
        const headColWidths = [tableWidth * 0.4, tableWidth * 0.35, tableWidth * 0.25];
        const locationParts = [location?.locationName, location?.building, location?.room]
            .map((v) => v?.trim())
            .filter((v): v is string => Boolean(v));
        const headValueRowHeight = calculateRowHeight(doc, headColWidths, [
            { text: formatDeviceLabel(device), fontSize: 10, wrap: true },
            { text: locationParts.join(' - '), fontSize: 10, wrap: true },
            { text: '', fontSize: 10 },
        ], baseRowHeight);
        const headTableHeight = baseRowHeight * (headTableRowCount - 1) + headValueRowHeight;

        // Höhe der (optionalen) Hinweis-Zeile vorab berechnen.
        let hintRowHeight = 0;
        if (hasDescription) {
            const hintLabelWidth = tableWidth * 0.2;
            hintRowHeight = calculateRowHeight(
                doc,
                [hintLabelWidth, tableWidth - hintLabelWidth],
                [
                    { text: 'Hinweis', bold: true, fontSize: 10 },
                    { text: description!, fontSize: 9, wrap: true },
                ],
                baseRowHeight,
            );
        }

        // Zeilen: Kopf-Tabelle, Ergebnis-Tabelle, (optional) Messwerte-Tabelle,
        // (optional) Hinweis-Zeile.
        let blockHeight = headTableHeight + 4 + baseRowHeight * resultTableRowCount + 4;
        if (showMeasurements) {
            blockHeight += measurementTableHeight;
        }
        blockHeight += hintRowHeight;

        // Neue Seite beginnen, falls der Block nicht mehr vollständig passt,
        // damit ein Gerät nicht über zwei Seiten verteilt wird.
        if (y + blockHeight > pageHeight - marginBottom) {
            doc.addPage();
            y = 20;
        }

        // Kopf-Tabelle: Gerät | Standort | Status, darunter Seriennummer | Schutzklasse | Prüfdatum
        y = drawDeviceInfoTable(doc, marginX, y, tableWidth, device, location, inspection);
        y += 4;

        // Prüfergebnis-Tabelle: Prüftyp | Ergebnis (inkl. eingebetteter
        // Messwerte-Tabelle sowie optionaler Hinweis-Zeile)
        y = drawInspectionResultsTable(doc, marginX, y, tableWidth, inspection, showMeasurements, description);
        y += 4;

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
