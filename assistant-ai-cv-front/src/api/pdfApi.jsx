// src/api/pdfApi.js

/**
 * Récupère le HTML pour l’aperçu (POST /api/pdf/html)
 */
export async function fetchCvHtml(structuredCV) {
    const res = await fetch('/api/pdf/html', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(structuredCV)
    });
    if (!res.ok) {
        throw new Error(`Erreur fetchCvHtml : ${res.status}`);
    }
    return await res.text();
}

/**
 * Récupère le Blob PDF (POST /api/pdf/generate)
 */
export async function generatePdfBlob(structuredCV) {
    const res = await fetch('/api/pdf/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(structuredCV)
    });
    if (!res.ok) {
        throw new Error(`Erreur generatePdfBlob : ${res.status}`);
    }
    return await res.blob();
}

/**
 * Télécharge le PDF généré en lançant un <a download>
 */
export async function downloadPdf(structuredCV) {
    const blob = await generatePdfBlob(structuredCV);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${structuredCV.full_name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
