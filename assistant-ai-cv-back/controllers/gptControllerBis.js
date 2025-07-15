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
- Output pure JSON only: start with “{” and end with “}”, no extra text or formatting.
- Skills must be atomic noun phrases only (e.g., “JavaScript”, “Data Analysis”).
- Personalize the CV to the job offer:
  • Include every skill explicitly listed in the offer that the candidate has in their CV.
  • Also infer and include any skills implied by their projects, experiences, or formations.
- For each experience and project: the goal , tasks1, task2, ... , Technologies
  all tailored to the job offer’s priorities.
- Do NOT invent information; use only what exists in the CV or the job offer.


Schema:
{
  "language": "fr" | "en",
  "full_name": string,
  "contact": {
    "email": string,
    "phone": string,
    "address": string,
    "city": string,
    "postal_code": string,
    "country": string,
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
    { "degree": string, "institution": string, "start_date": "Month YYYY", "end_date": "YMonth YYYY" | "present" }
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

