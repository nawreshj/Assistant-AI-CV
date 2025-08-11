// controllers/matchController.js

/** Utils de base **/
function asArray(x) { return Array.isArray(x) ? x : []; }

// Normalisation légère pour comparer proprement (cv vs offre)
function norm(s) {
    if (s == null) return '';
    return String(s)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire accents
        .toLowerCase()
        .replace(/\s*\([^)]*\)/g, '') // supprime "(ES6+)" etc.
        .trim();
}

// Lit liste de strings ou d’objets {name}/{language} et normalise
function parseNames(list) {
    return asArray(list)
        .map(it => (typeof it === 'string' ? it : (it?.name ?? it?.language ?? '')))
        .map(norm)
        .filter(Boolean);
}

/** Agrégation des technologies (exp + projets) **/
function flattenTechnologies(cv) {
    const techs = [];
    for (const ex of asArray(cv?.experiences)) {
        for (const t of asArray(ex?.technologies)) techs.push(t);
    }
    for (const pr of asArray(cv?.projects)) {
        for (const t of asArray(pr?.technologies)) techs.push(t);
    }
    return techs;
}

/** Ensembles “matched:true” côté CV **/
function cvMatchedSkillSet(cv) {
    const set = new Set();
    for (const s of asArray(cv?.skills)) if (s?.matched === true) set.add(norm(s.name));
    return set;
}
function cvMatchedTechSet(cv) {
    const set = new Set();
    for (const t of flattenTechnologies(cv)) if (t?.matched === true) set.add(norm(t.name));
    return set;
}
function cvMatchedSoftSet(cv) {
    const set = new Set();
    for (const s of asArray(cv?.soft_skills)) if (s?.matched === true) set.add(norm(s.name));
    return set;
}
function cvMatchedLangSet(cv) {
    const set = new Set();
    for (const l of asArray(cv?.languages)) if (l?.matched === true) set.add(norm(l.language));
    return set;
}
function cvKeywordSet(cv) {
    return new Set(asArray(cv?.keywords_in_common).map(norm));
}

/** Education : binaire (≥1 éducation matched) **/
function anyEducationMatched(cv) {
    return asArray(cv?.educations).some(e => e?.matched === true);
}

/** Poids internes (figés | somme ≈ 1) **/
const WEIGHTS = Object.freeze({
    skills: 0.40,
    technologies: 0.35,
    languages: 0.05,
    soft_skills: 0.10,
    education: 0.05,
    keywords: 0.05
});

// Couverture basée sur l’OFFRE (si l’offre ne demande rien → 1)
function offerCoverage(coveredCount, offerTotal) {
    if (!offerTotal || offerTotal <= 0) return 1;
    return coveredCount / offerTotal;
}

/** -------- SCORE OFFER-BASED --------
 * Dénominateur = #exigences de l’offre par section
 * Le CV “couvre” une exigence si l’élément correspondant est présent côté CV avec matched:true
 */
function computeScoreOfferBased(cv, offer) {
    // 1) Exigences normalisées
    const offSkills = parseNames(offer?.skills);
    const offTechs  = parseNames(offer?.technologies);
    const offSoft   = parseNames(offer?.soft_skills);
    const offLangs  = parseNames(offer?.languages);
    const offEdu    = parseNames(offer?.education);
    const offKw     = parseNames(offer?.keywords || offer?.keywords_required);

    // 2) Couvertures côté CV (ensembles matched)
    const cvSkills = cvMatchedSkillSet(cv);
    const cvTechs  = cvMatchedTechSet(cv);
    const cvSoft   = cvMatchedSoftSet(cv);
    const cvLangs  = cvMatchedLangSet(cv);
    const cvKw     = cvKeywordSet(cv);

    // 3) Comptes couverts
    const coveredSkills = offSkills.filter(n => cvSkills.has(n)).length;
    const coveredTechs  = offTechs.filter(n => cvTechs.has(n)).length;
    const coveredSoft   = offSoft.filter(n => cvSoft.has(n)).length;
    const coveredLang   = offLangs.filter(n => cvLangs.has(n)).length;
    const coveredKw     = offKw.filter(n => cvKw.has(n)).length;

    // 4) Couvertures (0..1) – dénominateur = offre
    const covSkills = offerCoverage(coveredSkills, offSkills.length);
    const covTechs  = offerCoverage(coveredTechs,  offTechs.length);
    const covSoft   = offerCoverage(coveredSoft,   offSoft.length);
    const covLang   = offerCoverage(coveredLang,   offLangs.length);
    const covEdu    = offerCoverage(anyEducationMatched(cv) ? 1 : 0, offEdu.length);
    const covKw     = offerCoverage(coveredKw, offKw.length);

    // 5) Score pondéré
    const score01 =
        WEIGHTS.skills * covSkills +
        WEIGHTS.technologies * covTechs +
        WEIGHTS.languages * covLang +
        WEIGHTS.soft_skills * covSoft +
        WEIGHTS.education * covEdu +
        WEIGHTS.keywords * covKw;

    return {
        score: Math.round(score01 * 100),
        breakdown: {
            skills: Number(covSkills.toFixed(3)),
            technologies: Number(covTechs.toFixed(3)),
            languages: Number(covLang.toFixed(3)),
            soft_skills: Number(covSoft.toFixed(3)),
            education: Number(covEdu.toFixed(3)),
            keywords: Number(covKw.toFixed(3))
        }
    };
}

/** -------- MISSING (basé offre) -------- */
function computeMissing(cv, offer = {}) {
    const offSkills = parseNames(offer.skills);
    const offTechs  = parseNames(offer.technologies);
    const offSoft   = parseNames(offer.soft_skills);
    const offLangs  = parseNames(offer.languages);
    const offEdu    = parseNames(offer.education);
    const offKw     = parseNames(offer.keywords || offer.keywords_required);

    const cvSkills = cvMatchedSkillSet(cv);
    const cvTechs  = cvMatchedTechSet(cv);
    const cvSoft   = cvMatchedSoftSet(cv);
    const cvLangs  = cvMatchedLangSet(cv);
    const cvKw     = cvKeywordSet(cv);

    const missingSkills = offSkills.filter(n => !cvSkills.has(n));
    const missingTechs  = offTechs.filter(n => !cvTechs.has(n));
    const missingSoft   = offSoft.filter(n => !cvSoft.has(n));
    const missingLang   = offLangs.filter(n => !cvLangs.has(n));
    const missingEdu    = offEdu.length ? (anyEducationMatched(cv) ? [] : offEdu) : [];
    const missingKw     = offKw.filter(n => !cvKw.has(n));

    return {
        skills: missingSkills,
        technologies: missingTechs,
        soft_skills: missingSoft,
        languages: missingLang,
        education: missingEdu,
        keywords: missingKw
    };
}

/** Endpoints **/

// POST /match/score  -> score CV only (pas de counts, pas de weights en param)
exports.computeMatchScore = async (req, res) => {
    try {
        const cv = req.body?.cv || req.body?.cvJSON;
        if (!cv) return res.status(400).json({ error: 'Champ "cv" manquant dans le corps de la requête.' });

        const result = computeScore(cv);
        return res.json(result);
    } catch (err) {
        console.error('Erreur computeMatchScore:', err);
        return res.status(500).json({ error: 'Erreur lors du calcul du score.' });
    }
};


