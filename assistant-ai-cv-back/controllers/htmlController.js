const ejs  = require('ejs');
const path = require('path');
const sectionTitles = {
    fr: {
        profile: "Profil",
        contact_block: "Contacts",
        skills:         "COMPÉTENCES TECHNIQUES",
        soft_skills:    "Atouts",
        languages:      "Langues",
        experiences:    "Expériences",
        educations:     "Formations",
        projects:       "Projets",
        certifications: "Certifications",
        hobbies:        "Centres d’intérêt"
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

/**
 * POST /api/pdf/html
 * Récupère le JSON structuré du CV en body,
 * génère le HTML complet via EJS,
 * et renvoie ce HTML brut pour affichage dans un iframe.
 */
exports.getCvHtml = async (req, res, next) => {
    try {

        const structuredCV = req.body;

        const lang = structuredCV.language || 'en';
        const titles = sectionTitles[lang] || sectionTitles.en;
        const renderData = { ...structuredCV, titles};


        const templatePath = path.join(__dirname, '../views/cvTemplate3.ejs');

        const html = await ejs.renderFile(templatePath, renderData);

        res
            .status(200)
            .set('Content-Type', 'text/html')
            .send(html);

    } catch (err) {
        console.error(' Erreur dans getCvHtml :', err);
        next(err);
    }
};
