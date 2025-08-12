const ejs       = require('ejs');
const path      = require('path');
const puppeteer = require('puppeteer');
const sectionTitles = {
    fr: {
        profile: "Profil",
        contact_block: "Contacts",
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
        contact_block: "Contacts",
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


        const templatePath = path.join(__dirname, '../views/cvTemplate3.ejs');
        console.log(' templatePath :', templatePath);

        const html = await ejs.renderFile(templatePath, renderData);
        console.log(' HTML généré (longueur) :', html.length);

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        console.log(' Puppeteer lancé');
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: 'networkidle0' });
        console.log('📄 Contenu chargé dans la page');

        const raw = await page.pdf({ /* tes options */ });

        const pdfBuffer = Buffer.isBuffer(raw)
            ? raw
            : Buffer.from(raw);



        await browser.close();
        console.log('🔒 Puppeteer fermé');

        res
            .status(200)
            .set({
                'Content-Type':        'application/pdf',
                'Content-Disposition': 'attachment; filename="CV.pdf"',
                'Content-Length':      pdfBuffer.length
            })
            .send(pdfBuffer);

    } catch (err) {
        console.error(' Erreur dans generatePdf :', err);
        next(err);
    }
}

module.exports = { generatePdf };
