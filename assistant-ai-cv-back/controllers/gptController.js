const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildCvExtractionPrompt(cvText) {
    return `
You are a CV parser.

Parse the raw CV text below and extract structured data using the function call. Return a JSON object with the following blocks:

- full_name: the candidate's complete name
- gender: deduce if possible using grammar or pronouns (male / female / unknown)
- contact_block: all contact details grouped as a single string
- profile: a short profile or introduction sentence if it exists (often at the top of the CV)
- skills: list of technical skills, programming languages, tools, frameworks
- soft_skills: interpersonal or personal qualities
- languages: spoken or written languages with optional levels
- experiences: one string per experience (include title, company, duration, description)
- educations: one string per education/training (degree, institution, years, etc.)
- certifications: optional, list of certifications mentioned in the CV (name, issuer, year if available)
- projects: optional, list of relevant academic or personal projects (title + short description)
- achievements: optional, list of accomplishments or results (e.g., awards, published work, notable results)
- hobbies: optional, list of interests or leisure activities

⚠️ Extraction Guidelines:
- Extract only what is explicitly written in the CV. Do not invent or assume.
- Preserve the original phrasing — no rephrasing, no summarizing.
- Return plain text only — no bullet points, markdown, or formatting.
- If a field does not exist, leave it empty or omit it.
- For "achievements", extract any clearly stated notable accomplishments (awards, results, etc.).
- For "projects", include any academic, personal or professional projects described as such.
- Ignore any motivational statements or goals.
- Focus on factual and verifiable content only.

--- CV Text ---
${cvText}
`;
}


function buildOfferExtractionPrompt(offerText) {
    return `
You are an HR parsing assistant.
Parse the raw job offer text below (variable ` + '`offerText`' + `) and return structured data via the function call.
--- Raw Job Offer Text ---
${offerText}
`;
}

function buildReformulationPrompt(cvData, offerData) {
    return `
You are an experienced HR professional and resume consultant.

Your task is to generate a structured and improved version of the candidate’s resume using the structured CV and job offer data provided below.

Candidate Data:
${JSON.stringify(cvData, null, 2)}

Job Offer Data:
${JSON.stringify(offerData, null, 2)}

Guidelines:
- Do NOT invent or add information. Use only what is explicitly or implicitly present in the CV.
- Reformulate the content to improve clarity, professionalism, and relevance to the job offer.
- Detect the main language used in the CV content and keep all text and section titles in that language.
- Highlight skills that are present in both the CV and the job offer using **bold** formatting.
- Group technical skills by category when applicable.
- Ensure consistent tone, grammar, and logical order.
- Output only the final structured result (function_call will handle formatting).
`;
}



function sanitizeCvText(raw) {
    return raw
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
}

exports.extractCv = async (req, res) => {
    const { cvText } = req.body;
    if (!cvText) return res.status(400).json({ error: 'Missing cvText.' });
    const cleanedText = sanitizeCvText(cvText);
    const cleanedOfferText = sanitizeCvText(offerText);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: buildCvExtractionPrompt(cleanedText) }],
            functions: [
                {
                    name: 'extract_cv',
                    description: 'Extract structured CV data',
                    parameters: {
                        type: 'object',
                        properties: {
                            last_name:        { type: 'string' },
                            first_name:       { type: 'string' },
                            contact: {
                                type: 'object',
                                properties: {
                                    email:   { type: 'string' },
                                    phone:   { type: 'string' },
                                    address: { type: 'string' }
                                },
                                required: ['email','phone']
                            },
                            skills:            { type: 'array',  items: { type: 'string' } },
                            soft_skills:       { type: 'array',  items: { type: 'string' } },
                            languages:         { type: 'array',  items: { type: 'string' } },
                            experience: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        title:     { type: 'string' },
                                        company:   { type: 'string' },
                                        start_date:{ type: 'string' },
                                        end_date:  { type: 'string' }
                                    },
                                    required: ['title','company']
                                }
                            },
                            education_level:   { type: 'string' },
                            desired_job_title: { type: 'string' }
                        },
                        required: ['last_name','first_name']
                    }
                }
            ],
            function_call: { name: 'extract_cv' },
            temperature: 0,
            max_tokens: 800
        });

        const args = response.choices[0].message.function_call.arguments;

        const cvData = JSON.parse(args);
        res.json({ cvData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.extractOffer = async (req, res) => {
    const { offerText } = req.body;
    if (!offerText) return res.status(400).json({ error: 'Missing offerText.' });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: buildOfferExtractionPrompt(offerText) }],
            functions: [
                {
                    name: 'extract_offer',
                    description: 'Extract structured job offer data',
                    parameters: {
                        type: 'object',
                        properties: {
                            job_title:               { type: 'string' },
                            company:                 { type: 'string' },
                            required_skills:         { type: 'array',  items: { type: 'string' } },
                            education_level_required:{ type: 'string' },
                            languages_required:      { type: 'array',  items: { type: 'string' } }
                        },
                        required: ['job_title','company']
                    }
                }
            ],
            function_call: { name: 'extract_offer' },
            temperature: 0,
            max_tokens: 150
        });

        const args = response.choices[0].message.function_call.arguments;
        const offerData = JSON.parse(args);
        res.json({ offerData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//----------------- fonction qui extract en meme temps on va voir si cava plus vite ----------------------
exports.extractBoth = async (req, res) => {
    const { cvText, offerText } = req.body;
    if (!cvText || !offerText) {
        return res.status(400).json({ error: 'Missing cvText or offerText.' });
    }
    //const cleanedCvText = sanitizeCvText(cvText);
    //const cleanedOfferText = sanitizeCvText(offerText);
    //console.log( cleanedCvText);
    try {
        console.log("Extraction des données CV et de l'offre avec GPT... ")
        const [cvResponse, offerResponse] = await Promise.all([
            openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: buildCvExtractionPrompt(cvText) }],
                functions: [
                    {
                        name: 'extract_cv',
                        description: 'Extract structured CV data in a flexible block format',
                        parameters: {
                            type: 'object',
                            properties: {
                                full_name: { type: 'string' },
                                gender: { type: 'string', enum: ['male', 'female', 'unknown'] },
                                contact_block: { type: 'string' },
                                cv_title: {type:'string'},
                                profile: { type: 'string' },
                                skills: { type: 'array', items: { type: 'string' } },
                                soft_skills: { type: 'array', items: { type: 'string' } },
                                languages: { type: 'array', items: { type: 'string' } },
                                experiences: {
                                    type: 'array',
                                    items: { type: 'string' } // un bloc texte par expérience
                                },
                                certifications: {
                                    type: 'array',
                                    items: { type: 'string' } // un bloc texte par certification
                                },
                                educations: {
                                    type: 'array',
                                    items: { type: 'string' } // un bloc texte par formation
                                },
                                projects: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                hobbies: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            },
                            required: ['full_name']
                        }
                    }
                ],
                function_call: { name: 'extract_cv' },
                temperature: 0,
                max_tokens: 1000
            }),
            openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: buildOfferExtractionPrompt(offerText) }],
                functions: [
                    {
                        name: 'extract_offer',
                        description: 'Extract structured job offer data',
                        parameters: {
                            type: 'object',
                            properties: {
                                job_title:               { type: 'string' },
                                company:                 { type: 'string' },
                                required_skills:         { type: 'array', items: { type: 'string' } },
                                education_level_required:{ type: 'string' },
                                languages_required:      { type: 'array', items: { type: 'string' } }
                            },
                            required: ['job_title', 'company']
                        }
                    }
                ],
                function_call: { name: 'extract_offer' },
                temperature: 0,
                max_tokens: 400
            })
        ]);

        const cvData = JSON.parse(cvResponse.choices[0].message.function_call.arguments);
        const offerData = JSON.parse(offerResponse.choices[0].message.function_call.arguments);
        console.log("Extraction des données pertinentes du CV et de l'offre realisé avec succès ! ");
        console.log(cvData);
        console.log(offerData);
        res.json({ cvData, offerData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

//----------------------------------------

exports.reformulateResume = async (req, res) => {
    const { cvData, offerData } = req.body;
    if (!cvData || !offerData) return res.status(400).json({ error: 'Missing cvData or offerData.' });

    try {
        console.log("Reformulation CV structurée avec GPT...");

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: buildReformulationPrompt(cvData, offerData) }],
            functions: [
                {
                    name: 'generate_structured_cv',
                    description: 'Generates a structured CV with personalized sections',
                    parameters: {
                        type: 'object',
                        properties: {
                            full_name:         { type: 'string' },
                            contact_block:     { type: 'string' },
                            cv_title:          { type: 'string' },
                            profile:           { type: 'string' },
                            skills: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            soft_skills: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            languages: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            experiences: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            educations: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            projects: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            certifications: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            },
                            hobbies: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    items: { type: 'array', items: { type: 'string' } }
                                }
                            }
                        },
                        required: ['full_name', 'cv_title', 'contact_block']
                    }
                }
            ],
            function_call: { name: 'generate_structured_cv' },
            temperature: 0.7,
            max_tokens: 1800
        });

        const structuredCV = JSON.parse(response.choices[0].message.function_call.arguments);

        console.log("✅ CV structuré généré !");
        console.log(structuredCV);
        res.json({ structuredCV });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

