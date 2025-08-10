const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const mammoth = require('mammoth');
const libre = require('libreoffice-convert');
const { promisify } = require('util');

libre.convertAsync = promisify(libre.convert);

// --------------------------
// Utils
// --------------------------
function getExt(filePath) {
    return (path.extname(filePath) || '').toLowerCase();
}
function isImageMime(mime) {
    return mime && mime.startsWith('image/');
}
function isPdfMime(mime) {
    return mime === 'application/pdf';
}
function isDocxMime(mime) {
    return mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}
function isDocMime(mime) {
    return mime === 'application/msword';
}
function isOdtMime(mime) {
    return mime === 'application/vnd.oasis.opendocument.text';
}

// --------------------------
// Image → OCR (Tesseract)
// --------------------------
async function preprocessImage(inputPath, outputPath) {
    await sharp(inputPath)
        .grayscale()
        .normalize()
        .sharpen()
        .resize({ width: 1200 })
        .toFile(outputPath);
}

async function extractTextFromImage(imagePath) {
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Fichier image introuvable : ${imagePath}`);
    }

    const cleanedPath = '/tmp/cleaned_cv.png';
    await preprocessImage(imagePath, cleanedPath);

    const worker = await Tesseract.createWorker();
    try {
        await worker.load();
        console.log('OCR en cours...');
        const { data } = await worker.recognize(cleanedPath, 'eng+fra');

        const cleanedText = data.text
            .replace(/[|><=*_••—]/g, '')
            .replace(/\n{2,}/g, '\n')
            .trim();

        console.log('✅ Texte (image) extrait avec succès !');
        return cleanedText;
    } catch (err) {
        console.error('Erreur OCR :', err);
        throw err;
    } finally {
        await worker.terminate();
        // On peut aussi supprimer cleanedPath si besoin
        fs.existsSync(cleanedPath) && fs.unlink(cleanedPath, () => {});
    }
}

// --------------------------
// PDF → texte
// --------------------------
async function extractTextFromPdf(pdfPath) {
    try {
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`Fichier PDF introuvable : ${pdfPath}`);
        }
        const dataBuffer = await fs.promises.readFile(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        console.log('✅ Texte (PDF) extrait avec succès !');
        return pdfData.text || '';
    } catch (err) {
        console.error('Erreur extraction PDF :', err);
        throw err;
    }
}

// --------------------------
// DOCX → texte (mammoth)
// --------------------------
async function extractTextFromDocx(docxPathOrBuffer) {
    try {
        const options = {};
        const result = Buffer.isBuffer(docxPathOrBuffer)
            ? await mammoth.extractRawText({ buffer: docxPathOrBuffer }, options)
            : await mammoth.extractRawText({ path: docxPathOrBuffer }, options);

        const text = (result.value || '')
            .replace(/\r/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        console.log('✅ Texte (DOCX) extrait avec succès !');
        return text;
    } catch (err) {
        console.error('Erreur extraction DOCX (mammoth) :', err);
        throw err;
    }
}

// --------------------------
// DOC / ODT → conversion → DOCX → texte
// (nécessite LibreOffice installé sur la machine)
// --------------------------
async function convertToDocxBuffer(inputBuffer, ext) {
    // ext attendu par libre: '.docx'
    // on convertit depuis .doc ou .odt vers .docx
    const targetExt = '.docx';
    try {
        const converted = await libre.convertAsync(inputBuffer, targetExt, undefined);
        return converted; // Buffer .docx
    } catch (err) {
        console.error(`Erreur conversion LibreOffice (${ext} → .docx) :`, err);
        throw new Error('Conversion vers DOCX via LibreOffice échouée. Vérifiez que LibreOffice est installé.');
    }
}

async function extractTextFromDocOrOdt(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier introuvable : ${filePath}`);
    }
    const ext = getExt(filePath); // .doc ou .odt
    const inputBuffer = await fs.promises.readFile(filePath);

    // Convertir vers DOCX
    const docxBuffer = await convertToDocxBuffer(inputBuffer, ext);

    // Extraire le texte avec mammoth
    const text = await extractTextFromDocx(docxBuffer);
    console.log(`✅ Texte (${ext}) extrait avec succès via conversion DOCX !`);
    return text;
}

// --------------------------
// Contrôleur principal
// --------------------------
/**
 * Contrôleur “extractBoth” :
 * - reçoit un upload de fichier pour le CV (PDF, image, DOCX, DOC, ODT),
 * - reçoit en même temps dans req.body.offerText le texte brut de l’offre,
 * - détecte le type de fichier pour le CV et appelle la bonne fonction d’extraction,
 * - renvoie un tableau [texteDuCv, texteDeLOffre].
 */
exports.extractBothText = async (req, res) => {
    const filePath  = req.file?.path;
    const offerText = req.body.offerText;

    if (!filePath)  return res.status(400).json({ error: 'Le fichier CV est manquant.' });
    if (!offerText) return res.status(400).json({ error: 'Le texte de l’offre est manquant.' });

    try {
        const mime = req.file.mimetype || '';
        const ext  = getExt(filePath);
        let cvText;

        if (isPdfMime(mime) || ext === '.pdf') {
            cvText = await extractTextFromPdf(filePath);
        } else if (isImageMime(mime) || ['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.bmp', '.heic', '.heif', '.webp'].includes(ext)) {
            cvText = await extractTextFromImage(filePath);
        } else if (isDocxMime(mime) || ext === '.docx') {
            cvText = await extractTextFromDocx(filePath);
        } else if (isDocMime(mime) || ext === '.doc' || isOdtMime(mime) || ext === '.odt') {
            // .doc et .odt → conversion via LibreOffice → docx → mammoth
            cvText = await extractTextFromDocOrOdt(filePath);
        } else {
            return res.status(400).json({
                error: 'Type de fichier non supporté (accepte : PDF, image, DOCX, DOC, ODT).'
            });
        }

        console.log('--- TEXTE CV (aperçu 400 chars) ---\n', (cvText || '').slice(0, 400));
        console.log('--- TEXTE OFFRE (aperçu 400 chars) ---\n', (offerText || '').slice(0, 400));

        return res.json([cvText || '', offerText || '']);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    } finally {
        // Supprimer le fichier temporaire
        if (filePath) fs.unlink(filePath, () => {});
    }
};
