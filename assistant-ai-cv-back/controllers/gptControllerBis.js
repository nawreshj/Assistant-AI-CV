// controllerBis.js
// Version "prompt-only" pour extraction et reformulation de CV sans function_call

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. Prompt pour extraction de CV
const systemPromptExtractCv = `
You are a CV parser.
Return ONLY a valid JSON object with these keys (omit or empty if absent):
{
  "language" : string,           // fr|en 
  "full_name": string,
  "gender": string,              // "male" | "female" | "unknown"
  "contact_block": [string],
  "profile": string,
  "skills": [string],
  "soft_skills": [string],
  "languages": [string],
  "experiences": [string],
  "educations": [string], // with the entire description of the experience
  "certifications": [string],
  "projects": [string], with the entire description of the project
  "achievements": [string],
  "hobbies": [string]
}
No markdown, no prose, no code blocks—only pure JSON.
`;

// 2. Prompt pour extraction de l'offre d'emploi
const systemPromptExtractOffer = `
You are a job-offer parser.
Return ONLY a valid JSON object with these keys (omit or empty if absent):
{
  "job_title": string,
  "company": string,
  "required_skills": [string],
  "education_level_required": string,
  "languages_required": [string]
}
No markdown, no prose, no code blocks—only pure JSON.
`;

// 3. Prompt pour reformulation du CV final
const systemPromptReformulate = `
You are an expert HR professional and resume consultant.

CRITICAL INSTRUCTIONS:

* Output pure JSON only: response must start with “{” and end with “}”, with no extra text or formatting.
* Properly escape all string values, including control characters (ASCII 0–31 except \\t, \\n, \\r).
* Detect and set \`"language"\` field to the CV’s original language (\`"fr"\` or \`"en"\`); output all text in that language.
* Do NOT include duplicate keys; use null for missing or unavailable values.
* Include every field defined in the schema; if a field has no data, return as empty string, object, or array.
* Dates must be in “Month YYYY” format (e.g., "June 2024" for English CVs or "juin 2024" for French CVs) or the literal “present” (or “présent” in French).* Skills must be extracted as individual atomic noun phrases. When a skill entry lists multiple items (comma- or colon-separated), split them into separate skill objects (e.g., “Java, Python, C++” becomes separate entries). Include every skill explicitly listed in the offer and any implied by the candidate’s experiences.
* Limit the \`"skills"\` array to a maximum of 10 items.
* **For both \`"skills"\` and \`"soft_skills"\`, use only competencies found in recognized repositories**—ESCO (v1.2), DISCO, SFIA (EN/FR), ROME or O\\*NET—adopting their official labels (in the CV’s language) and, when available, identifiers.
* Add field \`"keywords_in_common"\`: list of shared keywords between CV and job offer; ensure each appears in the CV content.
* For each experience and project, set \`"description"\` as an object with:
  * \`"goal"\`: a concise statement of the challenge or objective,
  * \`"items"\`: an array of bullet-point strings detailing context, responsibilities, technologies used, measurable outcomes, and how this relates to the job offer’s requirements.
* Write in an impersonal tone (third-person or passive voice; avoid first-person pronouns).
* Explicitly personalize the CV: tailor phrasing, reorder sections, and emphasize achievements per the job offer’s priorities.
* Do NOT invent or hallucinate new information; except that strongly implied details (such as skills or responsibilities evident from an experience or education) may be included if clearly supported by the CV.
* Include a personalized \`"cv_title"\` and \`"profile"\` that reflect the priorities and terminology of the job offer and add the type of contract.

Schema:
{
  "language": "fr" | "en",
  "full_name": string,
  "contact": {
    "email": string,
    "phone": string,
    "address": string,
    "linkedin": string | null,
    "github": string | null,
    "website": string | null
  },
  "cv_title": string,
  "profile": string,
  "skills": [
    { "name": string, "category": string, "matched": boolean }
  ],
  "soft_skills": [string],
  "languages": [
    { "language": string, "level": string , "matched": boolean }
  ],
  "experiences": [
    {
      "title": string,
      "company": string,
      "start_date": "Month YYYY",
      "end_date": "Month YYYY" | "present",
      "technologies": [string],
      "description":
      {
      "goal" : string , 
      "tasks" : [string]
      },
   
    }
  ],
  "educations": [
    { "degree": string, "institution": string, "start_date": "Month YYYY", "end_date": "YMonth YYYY" | "present","extra_informations": string }
  ],
  "projects": [
    {
      "title": string,
      "description":
      {
      "goal" : string , 
      "tasks" : [string]
      }
      "technologies": [string],
      "start_date": "Month YYYY" | null,
      "end_date": "Month YYYY" | null
      
    }
  ],
  "certifications": [
    { "name": string, "issuer": string, "date": "YYYY-MM", "matched": boolean }
  ],
  "hobbies": [string],
  "keywords_in_common": [string]
}
`;


// Helper: nettoyage et validation JSON
function isValidJson(raw) {
    try {
        const cleaned = raw.trim();
        JSON.parse(cleaned);
        return { valid: true, cleaned };
    } catch (e) {
        return { valid: false };
    }
}

// 1) Extraction CV seule
exports.extractCvPromptOnly = async (req, res) => {
    const { cvText } = req.body;
    if (!cvText) return res.status(400).json({ error: 'Missing cvText.' });

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPromptExtractCv },
            { role: 'user', content: cvText }
        ],
        temperature: 0.2
    });

    const raw = response.choices[0].message.content;
    const { valid, cleaned } = isValidJson(raw);
    if (!valid) return res.status(422).json({ error: 'Invalid JSON', raw });

    res.json(JSON.parse(cleaned));
};

// 2) Extraction Offre seule
exports.extractOfferPromptOnly = async (req, res) => {
    const { offerText } = req.body;
    if (!offerText) return res.status(400).json({ error: 'Missing offerText.' });

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPromptExtractOffer },
            { role: 'user', content: offerText }
        ],
        temperature: 0.2
    });

    const raw = response.choices[0].message.content;
    const { valid, cleaned } = isValidJson(raw);
    if (!valid) return res.status(422).json({ error: 'Invalid JSON', raw });

    res.json(JSON.parse(cleaned));
};

// 3) Extraction CV + Offre en parallèle
exports.extractBoth = async (req, res) => {
    const { cvText, offerText } = req.body;
    if (!cvText || !offerText) {
        return res.status(400).json({ error: 'Missing cvText or offerText.' });
    }

    try {
        const [cvResp, offerResp] = await Promise.all([
            openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPromptExtractCv },
                    { role: 'user', content: cvText }
                ],
                temperature: 0.2
            }),
            openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPromptExtractOffer },
                    { role: 'user', content: offerText }
                ],
                temperature: 0.2
            })
        ]);

        const cvRaw = cvResp.choices[0].message.content;
        const offerRaw = offerResp.choices[0].message.content;
        const { valid: cvValid, cleaned: cvClean } = isValidJson(cvRaw);
        const { valid: offerValid, cleaned: offerClean } = isValidJson(offerRaw);

        if (!cvValid || !offerValid) {
            return res.status(422).json({
                error: 'Invalid JSON',
                details: { cvRaw, offerRaw }
            });
        }

        const cvData = JSON.parse(cvClean);
        const offerData = JSON.parse(offerClean);
        console.log("extraction CV ");
        console.log(cvData);
        console.log("extraction offre")
        console.log(offerData);
        res.json({ cvData, offerData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// 4) Reformulation finale
exports.reformulateResume = async (req, res) => {
    const { cvData, offerData } = req.body;
    if (!cvData || !offerData) return res.status(400).json({ error: 'Missing cvData or offerData.' });

    const userPrompt = `Here is the extracted CV data:
${JSON.stringify(cvData, null, 2)}

Here is the extracted job offer data:
${JSON.stringify(offerData, null, 2)}

Please generate the final personalized CV JSON according to the schema above.`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPromptReformulate },
            { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
    });

    const raw = response.choices[0].message.content;
    const { valid, cleaned } = isValidJson(raw);
    console.log("C'est un format Json valide");
    console.log(JSON.parse(cleaned));
    if (!valid) return res.status(422).json({ error: 'Invalid JSON', raw });

    console.log("✅ CV structuré généré !");
    const finalCv = JSON.parse(cleaned);
    res.json({ structuredCV: finalCv });
    console.dir(cleaned, { depth: null, colors: true });};

