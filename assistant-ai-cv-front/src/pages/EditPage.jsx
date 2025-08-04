import React, { useState, useEffect } from 'react';
import '../styles/EditPage.css';

const EditPage = ({ structuredCV, onChange, onBack, onGenerate, language }) => {
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        const init = {};
        Object.keys(structuredCV).forEach(key => init[key] = true);
        setExpanded(init);
    }, [structuredCV]);

    const toggleSection = key => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const updateField = (section, path, value) => {
        const updated = { ...structuredCV };
        if (path) {
            const keys = path.split('.');
            let target = updated[section];
            keys.forEach((k, idx) => {
                if (idx === keys.length - 1) target[k] = value;
                else target = target[k];
            });
        } else {
            updated[section] = value;
        }
        onChange(updated);
    };

    const addItem = (section, subkey) => {
        const updated = { ...structuredCV };
        const arr = subkey ? updated[section][subkey] : updated[section];
        if (subkey) arr.push('');
        else arr.push({ technologies: [], description: { goal: '', tasks: [] } });
        onChange(updated);
    };

    const removeItem = (section, subkey, idx) => {
        const updated = { ...structuredCV };
        const arr = subkey ? updated[section][subkey] : updated[section];
        arr.splice(idx, 1);
        onChange(updated);
    };

    const labelFor = key => ({
        full_name: 'Nom complet', cv_title: 'Titre du CV', profile: 'Profil',
        skills: 'Compétences techniques', soft_skills: 'Atouts', hobbies: 'Centres d’intérêt',
        languages: 'Langues', experiences: 'Expériences', educations: 'Formations',
        projects: 'Projets', certifications: 'Certifications', contact: 'Contact', keywords_in_common: 'Mots-clés en commun'
    }[key] || key);

    const fmtDate = d => d === 'present' ? (language === 'fr' ? 'Présent' : 'Present') : d;

    return (
        <div className="edit-container">
            <h2>✏️ Modifier le CV</h2>

            {Object.entries(structuredCV).map(([section, value]) => {
                if (section === 'language') return null;
                return (
                    <div key={section} className="accordion-section">
                        <div className="accordion-header" onClick={() => toggleSection(section)}>
                            <span>{labelFor(section)}</span>
                            <span className={`arrow ${expanded[section] ? 'open' : ''}`}>⌄</span>
                        </div>
                        {expanded[section] && (
                            <div className="accordion-content">

                                {/* Simple string fields */}
                                {typeof value === 'string' && (
                                    section === 'profile' ? (
                                        <textarea
                                            className="large-input"
                                            rows={4}
                                            value={value}
                                            onChange={e => updateField(section, '', e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="large-input"
                                            value={value}
                                            onChange={e => updateField(section, '', e.target.value)}
                                        />
                                    )
                                )}

                                {/* Contact object */}
                                {section === 'contact' && (
                                    <div className="contact-grid">
                                        {['email','phone','address','linkedin','github','website'].map(field => (
                                            <div key={field} className="contact-field">
                                                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={value[field] || ''}
                                                    onChange={e => updateField('contact', field, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Array sections */}
                                {Array.isArray(value) && (
                                    <>
                                        {section === 'skills' && value.map((obj, i) => (
                                            <div key={i} className="item-row">
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    placeholder="Compétences, séparées par des virgules"
                                                    value={obj.name}
                                                    onChange={e => updateField('skills', `${i}.name`, e.target.value)}
                                                />
                                                <button onClick={() => removeItem('skills', null, i)}>❌</button>
                                            </div>
                                        ))}

                                        {['soft_skills','hobbies','keywords_in_common'].includes(section) && value.map((item, i) => (
                                            <div key={i} className="item-row">
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={item}
                                                    onChange={e => updateField(section, `${i}`, e.target.value)}
                                                />
                                                <button onClick={() => removeItem(section, null, i)}>❌</button>
                                            </div>
                                        ))}

                                        {section === 'languages' && value.map((obj, i) => (
                                            <div key={i} className="item-row">
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={obj.language}
                                                    onChange={e => updateField('languages', `${i}.language`, e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={obj.level}
                                                    onChange={e => updateField('languages', `${i}.level`, e.target.value)}
                                                />
                                                <button onClick={() => removeItem('languages', null, i)}>❌</button>
                                            </div>
                                        ))}

                                        {section === 'certifications' && value.map((obj, i) => (
                                            <div key={i} className="item-row">
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={obj.name}
                                                    onChange={e => updateField('certifications', `${i}.name`, e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={obj.issuer}
                                                    onChange={e => updateField('certifications', `${i}.issuer`, e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    value={obj.date}
                                                    onChange={e => updateField('certifications', `${i}.date`, e.target.value)}
                                                />
                                                <button onClick={() => removeItem('certifications', null, i)}>❌</button>
                                            </div>
                                        ))}

                                        {['experiences','projects'].includes(section) && value.map((obj, i) => (
                                            <div key={i} className="section-block">
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    placeholder="Titre"
                                                    value={obj.title}
                                                    onChange={e => updateField(section, `${i}.title`, e.target.value)}
                                                />
                                                {section === 'experiences' && (
                                                    <input
                                                        type="text"
                                                        className="large-input"
                                                        placeholder="Entreprise"
                                                        value={obj.company}
                                                        onChange={e => updateField('experiences', `${i}.company`, e.target.value)}
                                                    />
                                                )}
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    placeholder="Month YYYY"
                                                    value={obj.start_date}
                                                    onChange={e => updateField(section, `${i}.start_date`, e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    placeholder="Month YYYY ou present"
                                                    value={obj.end_date}
                                                    onChange={e => updateField(section, `${i}.end_date`, e.target.value)}
                                                />

                                                <div className="sub-array">
                                                    <strong>Technologies:</strong>
                                                    {obj.technologies.map((tech, j) => (
                                                        <div key={j} className="item-row">
                                                            <input
                                                                type="text"
                                                                className="large-input"
                                                                value={tech}
                                                                onChange={e => updateField(section, `${i}.technologies.${j}`, e.target.value)}
                                                            />
                                                            <button onClick={() => removeItem(section, 'technologies', j)}>❌</button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem(section, 'technologies')}>+ Tech</button>
                                                </div>

                                                <input
                                                    type="text"
                                                    className="large-input"
                                                    placeholder="Enjeu"
                                                    value={obj.description.goal}
                                                    onChange={e => updateField(section, `${i}.description.goal`, e.target.value)}
                                                />
                                                <div className="sub-array">
                                                    <strong>Tâches:</strong>
                                                    {obj.description.tasks.map((task, j) => (
                                                        <div key={j} className="item-row">
                                                            <input
                                                                type="text"
                                                                className="large-input"
                                                                value={task}
                                                                onChange={e => updateField(section, `${i}.description.tasks.${j}`, e.target.value)}
                                                            />
                                                            <button onClick={() => removeItem(section, 'description.tasks', j)}>❌</button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem(section, 'description.tasks')}>+ Tâche</button>
                                                </div>
                                            </div>
                                        ))}

                                        <button onClick={() => addItem(section, null)}>+ Ajouter</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="edit-actions">
                <button onClick={onBack} className="btn btn-secondary">Aperçu</button>
                <button onClick={onGenerate} className="btn btn-primary">Générer le CV en PDF</button>
            </div>
        </div>
    );
};

export default EditPage;