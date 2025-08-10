// controllers/matchController.js
/**
 * Scoring simple basé sur les flags `matched` du CV structuré.
 * Ratio par section = (#items avec matched === true) / (#items totaux)
 * Sections couvertes : skills, technologies (exp + projets), languages, soft_skills, education, keywords_in_common
 * Score final = somme pondérée des couvertures, en pourcentage.
 */

function asArray(x) {
    return Array.isArray(x) ? x : [];
}

function countMatched(arr, key = 'matched') {
    let total = 0;
    let matched = 0;
    for (const it of asArray(arr)) {
        total += 1;
        if (it && it[key] === true) matched += 1;
    }
    return { total, matched };
}

function coverage(matched, total) {
    if (!total || total <= 0) return 0;
    return matched / total; // 0..1
}

function flattenTechnologies(cv) {
    const exps = asArray(cv?.experiences);
    const projs = asArray(cv?.projects);
    const techs = [];

    for (const ex of exps) {
        for (const t of asArray(ex?.technologies)) techs.push(t);
    }
    for (const pr of projs) {
        for (const t of asArray(pr?.technologies)) techs.push(t);
    }
    return techs;
}

function educationCoverage(cv) {
    // 1 si au moins une éducation a matched === true, sinon 0
    const edus = asArray(cv?.educations);
    const anyMatched = edus.some(e => e?.matched === true);
    return {
        total: edus.length,
        matched: edus.filter(e => e?.matched === true).length,
        coverage: anyMatched ? 1 : 0
    };
}

function keywordsCoverage(cv, baseline = 8) {
    // Simple : plus il y a de "keywords_in_common", mieux c’est. Baseline bornée.
    const kws = asArray(cv?.keywords_in_common);
    const total = kws.length;
    const cov = total === 0 ? 0 : Math.min(1, total / baseline);
    return { total, coverage: cov };
}

// Poids simples (somme = 1)
const WEIGHTS = {
    skills: 0.45,
    technologies: 0.35,
    languages: 0.05,
    soft_skills: 0.10,
    education: 0.05,
    keywords: 0.00 // mets 0.05 si tu veux les compter
};

function computeScore(cv, weights = WEIGHTS) {
    // Skills
    const { total: skTotal, matched: skMatched } = countMatched(asArray(cv?.skills));
    const covSkills = coverage(skMatched, skTotal);

    // Technologies (exp + projets)
    const allTechs = flattenTechnologies(cv);
    const { total: teTotal, matched: teMatched } = countMatched(allTechs);
    const covTechs = coverage(teMatched, teTotal);

    // Languages
    const { total: lgTotal, matched: lgMatched } = countMatched(asArray(cv?.languages));
    const covLangs = coverage(lgMatched, lgTotal);

    // Soft skills
    const { total: ssTotal, matched: ssMatched } = countMatched(asArray(cv?.soft_skills));
    const covSoft = coverage(ssMatched, ssTotal);

    // Education (booléen 0/1 mais on renvoie aussi les compteurs)
    const edu = educationCoverage(cv);

    // Keywords_in_common (optionnel)
    const kw = keywordsCoverage(cv);

    const score01 =
        weights.skills * covSkills +
        weights.technologies * covTechs +
        weights.languages * covLangs +
        weights.soft_skills * covSoft +
        weights.education * edu.coverage +
        weights.keywords * kw.coverage;

    const score = Math.round(score01 * 100); // entier 0..100

    return {
        score,
        breakdown: {
            skills: Number(covSkills.toFixed(3)),
            technologies: Number(covTechs.toFixed(3)),
            languages: Number(covLangs.toFixed(3)),
            soft_skills: Number(covSoft.toFixed(3)),
            education: Number(edu.coverage.toFixed(3)),
            keywords: Number(kw.coverage.toFixed(3))
        },
        counts: {
            skills: { total: skTotal, matched: skMatched },
            technologies: { total: teTotal, matched: teMatched },
            languages: { total: lgTotal, matched: lgMatched },
            soft_skills: { total: ssTotal, matched: ssMatched },
            education: { total: edu.total, matched: edu.matched },
            keywords_in_common: { total: kw.total }
        }
    };
}

/**
 * POST /match/score
 * Body attendu : { cv: <cvJSON> }  (offer non requis dans cette version simple)
 */
exports.computeMatchScore = async (req, res) => {
    try {
        const cv = req.body?.cv || req.body?.cvJSON;
        console.log('CT:', req.headers['content-type']);
        console.log('BODY RAW:', req.body);

        if (!cv) {
            return res.status(400).json({ error: 'Champ "cv" manquant dans le corps de la requête.' });
        }

        const weights = { ...WEIGHTS, ...(req.body?.weights || {}) }; // optionnel: override
        const result = computeScore(cv, weights);

        return res.json(result);
    } catch (err) {
        console.error('Erreur computeMatchScore:', err);
        return res.status(500).json({ error: 'Erreur lors du calcul du score.' });
    }
};
