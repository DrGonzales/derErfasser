// Stub-Modul für optionale jsPDF-Abhängigkeiten (html2canvas, dompurify, canvg),
// die ausschließlich von den jsPDF-Funktionen `doc.html()` und
// `doc.addSvgAsImage()` benötigt werden. Diese Funktionen werden in dieser
// App nicht verwendet (wir nutzen nur text/rect/circle/addImage/addPage).
//
// Ohne diesen Alias würde Vite die echten, sehr großen Pakete (~230 KB gzip)
// in separate Chunks bündeln, obwohl sie zur Laufzeit nie geladen werden
// (die App ist außerdem komplett offline-fähig, ein Nachladen von einem CDN
// ist ohnehin nicht vorgesehen/erlaubt). Sollte einer der jsPDF-Codepfade
// dieses Stub-Modul doch einmal zur Laufzeit anfordern, wird bewusst ein
// Fehler geworfen, damit das Problem sofort auffällt.
export default new Proxy(
    {},
    {
        get() {
            throw new Error(
                'Diese jsPDF-Funktion (doc.html()/doc.addSvgAsImage()) wird in dieser App nicht unterstützt.',
            );
        },
    },
);
