const ejs       = require('ejs');
const path      = require('path');
const puppeteer = require('puppeteer');
const sectionTitles = {
    fr: {
        profile: "Profil",
        skills:         "Compétences Techniques",
        soft_skills:    "Atouts",
        languages:      "Langues",
        experiences:    "Experiences",
        educations:     "Formations",
        projects:       "Projets",
        certifications: "Certifications",
        hobbies:        "Loisirs"
    },
    en: {
        profile:"Profile",
        skills:         "Technical Skills",
        soft_skills:    "Soft Skills",
        languages:      "Languages",
        experiences:    "Experiences",
        educations:     "Education",
        projects:       "Projects",
        certifications: "Certifications",
        hobbies:        "Hobbies"
    }
};


async function generatePdf(req, res, next) {
    try {
        // 1) Récupère le JSON envoyé
        const structuredCV = req.body;
        console.log('🗂 structuredCV reçu :', structuredCV);
        // 1bis) Détermine la langue et les titres
        const lang = structuredCV.language || 'en';
        const titles = sectionTitles[lang] || sectionTitles.en;

// 1ter) Injecte le mapping dans les données passées à EJS
        const renderData = { ...structuredCV, titles };

        // 2) Chemin vers le template
        const templatePath = path.join(__dirname, '../views/cvTemplatebis.ejs');
        console.log('🔗 templatePath :', templatePath);

        // 3) Rend le HTML
        const html = await ejs.renderFile(templatePath, renderData);
        console.log('📝 HTML généré (longueur) :', html.length);

        // 4) Lancement de Puppeteer
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        console.log('🚀 Puppeteer lancé');
        const page = await browser.newPage();

        // 5) Injection du HTML et attente du rendu
        await page.setContent(html, { waitUntil: 'networkidle0' });
        console.log('📄 Contenu chargé dans la page');

        // 6) Génère le PDF (Uint8Array ou ArrayBuffer)
        const raw = await page.pdf({ /* tes options */ });

// 6a) Si ce n'est pas un Buffer, on le convertit
        const pdfBuffer = Buffer.isBuffer(raw)
            ? raw
            : Buffer.from(raw);



        // 7) Ferme le browser
        await browser.close();
        console.log('🔒 Puppeteer fermé');

        // 8) Envoi de la réponse PDF
        res
            .status(200)
            .set({
                'Content-Type':        'application/pdf',
                'Content-Disposition': 'attachment; filename="CV.pdf"',
                'Content-Length':      pdfBuffer.length
            })
            .send(pdfBuffer);

    } catch (err) {
        console.error('❌ Erreur dans generatePdf :', err);
        next(err);
    }
}

module.exports = { generatePdf };
