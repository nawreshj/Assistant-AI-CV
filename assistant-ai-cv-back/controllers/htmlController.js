

const ejs  = require('ejs');            // Moteur de template Embedded JavaScript
const path = require('path');           // Utils pour gérer les chemins de fichier
const sectionTitles = {
    fr: {
        profile: "Profil",
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
        // 1) Lecture du JSON structuré envoyé par le client
        const structuredCV = req.body;
        console.log('📥 getCvHtml payload:', structuredCV);

        const lang = structuredCV.language || 'en';
        const titles = sectionTitles[lang] || sectionTitles.en;
        const renderData = { ...structuredCV, titles };


        // 2) Construction du chemin vers le fichier de template EJS
        const templatePath = path.join(__dirname, '../views/cvTemplatebis.ejs');
        console.log('🔗 Template EJS path:', templatePath);

        // 3) Rend le template en HTML string
        const html = await ejs.renderFile(templatePath, renderData);
        console.log('✅ HTML généré (length):', html.length);

        // 4) Renvoi du HTML au client (Content-Type text/html)
        res
            .status(200)
            .set('Content-Type', 'text/html')
            .send(html);

    } catch (err) {
        console.error('❌ Erreur dans getCvHtml :', err);
        next(err); // passe l'erreur au middleware global
    }
};
