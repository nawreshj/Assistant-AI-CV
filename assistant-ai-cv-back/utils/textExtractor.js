// utils/extracteur.js

const fs = require('fs');
const pdfParse = require('pdf-parse');
const { createWorker } = require('tesseract.js');

/**
 * Lit le PDF en streaming et renvoie tout le texte extrait.
 * @param {string} pdfPath - Chemin vers le fichier PDF.
 * @returns {Promise<string>} - Le texte complet du PDF.
 */
const extractTextFromPdf = async function (pdfPath) {
    try {
        // Crée un flux de lecture non bloquant pour le PDF
        const stream = fs.createReadStream(pdfPath);

        // pdfParse peut travailler directement sur un stream
        const pdfData = await pdfParse(stream);

        // pdfData.text contient tout le contenu texte du PDF
        return pdfData.text;
    } catch (err) {
        console.error('Erreur lors de l’extraction du PDF :', err);
        throw err;
    }
};

/**
 * Extrait le texte d’une image en utilisant Tesseract.js.
 * @param {string} imagePath - Chemin vers l’image (PNG, JPEG, JPG, etc.).
 * @returns {Promise<string>} - Le texte reconnu dans l’image.
 */
const extractTextFromImage = async function (imagePath) {
    // Crée un worker Tesseract
    const worker = createWorker({
        logger: () => {}
    });

    try {
        await worker.load();
        // Charge les langues anglais + français
        await worker.loadLanguage('eng+fra');
        await worker.initialize('eng+fra');

        // Lance la reconnaissance sur l’image
        const { data } = await worker.recognize(imagePath);

        // data.text contient le texte extrait
        return data.text.trim();
    } catch (err) {
        console.error('Erreur lors de l’extraction OCR :', err);
        throw err;
    } finally {
        // Toujours arrêter le worker pour libérer la mémoire
        try {
            await worker.terminate();
        } catch {}
    }
};

module.exports = {
    extractTextFromPdf,
    extractTextFromImage
};
