// controllers/matchController.js

// utils rapides
const asArray = (x) => (Array.isArray(x) ? x : []);

function norm(s) {
    if (s == null) return '';
    return String(s)
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s*\([^)]*\)/g, '')
        .trim();
}

const parseNames = (list) =>
    asArray(list)
        .map((it) => (typeof it === 'string' ? it : (it?.name ?? it?.language ?? '')))
        .map(norm)
        .filter(Boolean);

// aggrège techs depuis exp + projets
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

// ensembles matched côté CV
const cvMatchedSkillSet = (cv) => {
    const set = new Set();
    for (const s of asArray(cv?.skills)) if (s?.matched === true) set.add(norm(s.name));
    return set;
};

function cvMatchedTechSet(cv) {
    const set = new Set();
    for (const t of flattenTechnologies(cv)) if (t?.matched === true) set.add(norm(t.name));
    return set;
}

const cvMatchedSoftSet = (cv) => {
    const set = new Set();
    for (const s of asArray(cv?.soft_skills)) if (s?.matched === true) set.add(norm(s.name));
    return set;
};

const cvMatchedLangSet = (cv) => {
    const set = new Set();
    for (const l of asArray(cv?.languages)) if (l?.matched === true) set.add(norm(l.language));
    return set;
};

const cvKeywordSet = (cv) => new Set(asArray(cv?.keywords_in_common).map(norm));

// éducation : au moins une “matched”
const anyEducationMatched = (cv) => asArray(cv?.educations).some((e) => e?.matched === true);

// poids (simple et suffisant)
const WEIGHTS = Object.freeze({
    skills: 0.40,
    technologies: 0.35,
    languages: 0.05,
    soft_skills: 0.10,
    education: 0.05,
    keywords: 0.05,
});

// coverage basé offre
function offerCoverage(coveredCount, offerTotal) {
    if (!offerTotal || offerTotal <= 0) return 1;
    return coveredCount / offerTotal;
}

// ex: "francais courant" -> "francais"
function baseLang(s) {
    const n = norm(s);
    const first = n.split(/\s+/)[0];
    return first || n;
}

// matching moins strict pour éviter les faux négatifs
const tokens = (s) => norm(s).split(/[^a-z0-9+.#]+/).filter(Boolean);

function looseHas(cvSet, name) {
    const t = tokens(name);
    if (cvSet.has(norm(name))) return true;
    for (const x of cvSet) {
        const tx = tokens(x);
        if (tx.some((tok) => t.includes(tok))) return true;
    }
    return false;
}

// ---- score basé offre
function computeScoreOfferBased(cv, offer) {
    // normalisation
    const offSkills = parseNames(offer?.skills);
    const offTechs  = parseNames(offer?.technologies);
    const offSoft   = parseNames(offer?.soft_skills);
    const offLangs  = parseNames(offer?.languages).map(baseLang);
    const offEdu    = parseNames(offer?.education);
    const offKw     = parseNames(offer?.keywords || offer?.keywords_required);

    // // debug:
    // console.log('offer langs raw:', offer?.languages, '->', offLangs);

    // sets côté CV
    const cvSkills = cvMatchedSkillSet(cv);
    const cvTechs  = cvMatchedTechSet(cv);
    const cvSoft   = cvMatchedSoftSet(cv);
    const cvLangs  = new Set(Array.from(cvMatchedLangSet(cv)).map(baseLang));
    const cvKw     = cvKeywordSet(cv);

    // comptes couverts
    const coveredSkills = offSkills.filter((n) => cvSkills.has(n)).length;
    const coveredTechs  = offTechs.filter((n) => cvTechs.has(n)).length;
    const coveredSoft   = offSoft.filter((n) => cvSoft.has(n)).length;
    const coveredLang   = offLangs.filter((n) => cvLangs.has(n)).length;
    const coveredKw     = offKw.filter((n) => cvKw.has(n)).length;

    // coverage sur 0..1
    const covSkills = offerCoverage(coveredSkills, offSkills.length);
    const covTechs  = offerCoverage(coveredTechs,  offTechs.length);
    const covSoft   = offerCoverage(coveredSoft,   offSoft.length);
    const covLang   = offerCoverage(coveredLang,   offLangs.length);
    const covEdu    = offerCoverage(anyEducationMatched(cv) ? 1 : 0, offEdu.length);
    const covKw     = offerCoverage(coveredKw, offKw.length);

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
            keywords: Number(covKw.toFixed(3)),
        },
    };
}

// ---- missing
function computeMissing(cv, offer = {}) {
    const offSkills = parseNames(offer.skills);
    const offTechs  = parseNames(offer.technologies);
    const offSoft   = parseNames(offer.soft_skills);
    const offLangs  = parseNames(offer.languages).map(baseLang);
    const offEdu    = parseNames(offer.education);
    const offKw     = parseNames(offer.keywords || offer.keywords_required);

    const cvSkills = cvMatchedSkillSet(cv);
    const cvTechs  = cvMatchedTechSet(cv);
    const cvSoft   = cvMatchedSoftSet(cv);
    const cvLangs  = new Set(Array.from(cvMatchedLangSet(cv)).map(baseLang));
    const cvKw     = cvKeywordSet(cv);

    const missingSkills = offSkills.filter((n) => !looseHas(cvSkills, n));
    const missingTechs  = offTechs.filter((n) => !looseHas(cvTechs, n));
    const missingSoft   = offSoft.filter((n) => !looseHas(cvSoft, n));
    const missingKw     = offKw.filter((n) => !looseHas(cvKw, n));
    const missingLang   = offLangs.filter((n) => !cvLangs.has(n));
    const missingEdu    = offEdu.length ? (anyEducationMatched(cv) ? [] : offEdu) : [];

    return {
        skills: missingSkills,
        technologies: missingTechs,
        soft_skills: missingSoft,
        languages: missingLang,
        education: missingEdu,
        keywords: missingKw,
    };
}

// ---- covered (juste pour l'affichage positif)
function listCoveredFromCv(cv) {
    const skills = asArray(cv?.skills).filter((s) => s?.matched === true).map((s) => s?.name).filter(Boolean);

    const technologies = flattenTechnologies(cv)
        .filter((t) => t?.matched === true)
        .map((t) => t?.name)
        .filter(Boolean);

    const soft_skills = asArray(cv?.soft_skills).filter((s) => s?.matched === true).map((s) => s?.name).filter(Boolean);

    const languages = asArray(cv?.languages)
        .filter((l) => l?.matched === true)
        .map((l) => (l?.level ? `${l.language} – ${l.level}` : l?.language))
        .filter(Boolean);

    const education = asArray(cv?.educations)
        .filter((e) => e?.matched === true)
        .map((e) => (e?.institution ? `${e.degree} – ${e.institution}` : e?.degree))
        .filter(Boolean);

    const keywords = asArray(cv?.keywords_in_common).filter(Boolean);

    return { skills, technologies, soft_skills, languages, education, keywords };
}

// ---- endpoint
exports.computeMatchScoreWithOffer = async (req, res) => {
    try {
        const cv = req.body?.cv || req.body?.cvJSON;
        const offer = req.body?.offer || {};
        if (!cv)    return res.status(400).json({ error: 'Champ "cv" manquant.' });
        if (!offer) return res.status(400).json({ error: 'Champ "offer" manquant.' });

        const base = computeScoreOfferBased(cv, offer);
        const missing = computeMissing(cv, offer);
        const covered = listCoveredFromCv(cv);

        return res.json({ ...base, missing, covered });
    } catch (err) {
        console.error('Erreur computeMatchScoreWithOffer:', err);
        return res.status(500).json({ error: 'Erreur lors du calcul du score avec offre.' });
    }
};
