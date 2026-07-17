/**
 * Rendert einen Donut-Chart (wie DonutChart.svelte) als PNG-Data-URL,
 * damit er per jsPDF (doc.addImage) in den PDF-Bericht eingebettet werden kann.
 *
 * Die Zeichenlogik spiegelt DonutChart.svelte: Segmente werden proportional
 * zu ihrem Anteil an `total` als Kreissektoren gezeichnet, in der Mitte
 * bleibt ein "Loch" (Fläche in Surface-Farbe) mit optionalem Center-Label.
 */

export type ChartSegment = { label: string; value: number; color: string };

export interface RenderDonutOptions {
    /** Kantenlänge des quadratischen Canvas in px (Bildgröße, keine PDF-Einheit). */
    size?: number;
    /** Dicke des Rings relativ zur Größe (0..0.5). */
    thicknessRatio?: number;
    /** Farbe des "Lochs" in der Mitte (Fallback, falls keine Segmente). */
    holeColor?: string;
    /** Farbe für einen leeren Donut (total === 0). */
    emptyColor?: string;
    /** Text, der zentriert in der Mitte angezeigt wird. */
    centerLabel?: string;
    /** Textfarbe des Center-Labels. */
    centerLabelColor?: string;
}

export function renderDonutToDataUrl(
    segments: ChartSegment[],
    total: number,
    options: RenderDonutOptions = {},
): string {
    const {
        size = 300,
        thicknessRatio = 0.32,
        holeColor = '#ffffff',
        emptyColor = '#d8ded4',
        centerLabel,
        centerLabelColor = '#17211d',
    } = options;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas-2D-Kontext konnte nicht erstellt werden');
    }

    const center = size / 2;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * (1 - thicknessRatio);

    ctx.clearRect(0, 0, size, size);

    if (total <= 0) {
        // Kein Ergebnis: kompletter Ring in neutraler "Empty"-Farbe.
        drawRingSegment(ctx, center, outerRadius, innerRadius, 0, Math.PI * 2, emptyColor);
    } else {
        let cumulative = 0;
        const startAngleOffset = -Math.PI / 2; // 12-Uhr-Position wie CSS conic-gradient
        for (const segment of segments) {
            if (segment.value === 0) continue;
            const startAngle = startAngleOffset + (cumulative / total) * Math.PI * 2;
            cumulative += segment.value;
            const endAngle = startAngleOffset + (cumulative / total) * Math.PI * 2;
            drawRingSegment(ctx, center, outerRadius, innerRadius, startAngle, endAngle, segment.color);
        }
    }

    // Loch in der Mitte
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = holeColor;
    ctx.fill();

    if (centerLabel) {
        ctx.fillStyle = centerLabelColor;
        ctx.font = `bold ${Math.round(innerRadius * 0.5)}px Helvetica, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerLabel, center, center);
    }

    return canvas.toDataURL('image/png');
}

function drawRingSegment(
    ctx: CanvasRenderingContext2D,
    center: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number,
    color: string,
): void {
    ctx.beginPath();
    ctx.moveTo(center + Math.cos(startAngle) * outerRadius, center + Math.sin(startAngle) * outerRadius);
    ctx.arc(center, center, outerRadius, startAngle, endAngle, false);
    ctx.arc(center, center, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}
