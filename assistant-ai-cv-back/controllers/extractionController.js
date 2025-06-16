
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js')
const sharp = require('sharp');

async function preprocessImage(inputPath, outputPath) {
    await sharp(inputPath)
        .grayscale()           // désaturation
        .normalize()           // améliore contraste
        .sharpen()             // accentue les contours
        .resize({ width: 1200 }) // agrandit pour une meilleure lecture
        .toFile(outputPath);
}


async function extractTextFromPdf(pdfPath) {
    try {
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`Fichier PDF introuvable : ${pdfPath}`);
        }
        const dataBuffer = await fs.promises.readFile(pdfPath);
        const pdfData = await pdfParse(dataBuffer);
        console.log("Texte  extrait de du CV pdf avec succès!")
        return pdfData.text;
    } catch (err) {
        console.error('Erreur extraction PDF :', err);
        throw err;
    }
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
       // await worker.loadLanguage('fra+eng');
       // await worker.initialize('fra+eng');

        console.log("OCR en cours...");
        const { data } = await worker.recognize(cleanedPath,'eng+fra');


        // Nettoyage basique du texte
        const cleanedText = data.text
            .replace(/[|><=*_••—]/g, '') // supprime les caractères parasites
            .replace(/\n{2,}/g, '\n')     // réduit les sauts de ligne multiples
            .trim();

        console.log("✅ Texte extrait avec succès !");
        return cleanedText;
    } catch (err) {
        console.error('Erreur OCR :', err);
        throw err;
    } finally {
        await worker.terminate();
    }
}

/**
 * Contrôleur “extractBoth” :
 * - reçoit un upload de fichier pour le CV (soit PDF, soit image),
 * - reçoit en même temps dans req.body.offerText le texte brut de l’offre,
 * - détecte le type de fichier pour le CV et appelle la bonne fonction d’extraction,
 * - renvoie un tableau [texteDuCv, texteDeLOffre].
 */
exports.extractBothText = async (req, res) => {
    const filePath  = req.file?.path; // recupération du chemin dudocument upbloadé par multer
    const offerText = req.body.offerText;

    if (!filePath)  return res.status(400).json({ error: 'Le fichier CV est manquant.' });
    if (!offerText) return res.status(400).json({ error: 'Le texte de l’offre est manquant.' });

    try {
        const mime = req.file.mimetype; // recupération du format du doc garce a muler
        let cvText; // let car modifiable : on va y mettre le texte du CV

        if (mime === 'application/pdf') {
            cvText = await extractTextFromPdf(filePath);
        } else if (mime.startsWith('image/')) {
            // si mimetype commence par "image/" --> alors image
            cvText = await extractTextFromImage(filePath);
        } else {
            return res.status(400).json({
                error: 'Type de fichier non supporté (seulement PDF ou image).'
            });
        }
        console.log(cvText);
        console.log(offerText)
        return res.json([cvText, offerText]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    } finally {
        // Supprimer le fichier temporaire pour pas stocker pour rien
        fs.unlink(filePath, () => {});
    }
};
