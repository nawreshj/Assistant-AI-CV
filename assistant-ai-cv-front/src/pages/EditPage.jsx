// EditPage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/EditPage.css';

const specialSections = ['skills', 'soft_skills', 'hobbies', 'certifications'];

const EditPage = ({ structuredCV, onChange, onBack, onGenerate }) => {
    // État d'ouverture des sections
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        // On initialise tout ouvert
        const init = {};
        Object.keys(structuredCV).forEach(key => {
            init[key] = true;
        });
        setExpanded(init);
    }, [structuredCV]);

    const toggleSection = section => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChange = (section, key, value) => {
        const updated = { ...structuredCV };
        if (value !== null && typeof updated[section] === 'object' && 'items' in updated[section]) {
            if (key === 'title') updated[section].title = value;
            else updated[section].items[key] = value;
        } else {
            updated[section] = value;
        }
        onChange(updated);
    };

    const handleAddItem = section => {
        const updated = { ...structuredCV };
        if (!updated[section].items) {
            updated[section].items = [];
        }
        updated[section].items.push('');
        onChange(updated);
    };

    const handleRemoveItem = (section, index) => {
        const updated = { ...structuredCV };
        if (Array.isArray(updated[section].items)) {
            updated[section].items.splice(index, 1);
            onChange(updated);
        }
    };

    const labelFor = key => {
        switch (key) {
            case 'full_name':     return 'Nom complet';
            case 'cv_title':      return 'Titre du CV';
            case 'profile':       return 'Profil';
            case 'experiences':   return 'Expériences';
            case 'educations':    return 'Formations';
            case 'projects':      return 'Projets';
            case 'languages':     return 'Langues';
            case 'skills':        return 'Compétences techniques';
            case 'soft_skills':   return 'Atouts';
            case 'certifications':return 'Certifications';
            case 'hobbies':       return 'Centres d’intérêt';
            default:
                return structuredCV[key]?.title || key;
        }
    };

    return (
        <div className="edit-container">
            <h2>✏️ Modifier le CV</h2>

            {Object.entries(structuredCV).map(([sectionKey, sectionValue]) => {
                // On ignore le champ language
                if (sectionKey === 'language') return null;

                return (
                    <div className="accordion-section" key={sectionKey}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleSection(sectionKey)}
                        >
                            <span>{labelFor(sectionKey)}</span>
                            <span className={`arrow ${expanded[sectionKey] ? 'open' : ''}`}>⌄</span>
                        </div>

                        {expanded[sectionKey] && (
                            <div className="accordion-content">
                                {/* Champs simples */}
                                {typeof sectionValue === 'string' && (
                                    sectionKey === 'profile' ? (
                                        <textarea
                                            className="regular-textarea"
                                            rows={4}
                                            value={sectionValue}
                                            onChange={e => handleChange(sectionKey, null, e.target.value)}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            className="long-input"
                                            size={78}
                                            value={sectionValue}
                                            onChange={e => handleChange(sectionKey, null, e.target.value)}
                                        />
                                    )
                                )}

                                {/* Sections à items */}
                                {typeof sectionValue === 'object' && (
                                    <>
                                        {/* Affiche les items existants avec bouton Supprimer */}
                                        {(sectionValue.items || []).map((item, idx) => (
                                            <div className="item-row" key={idx}>
                                                {specialSections.includes(sectionKey) ? (
                                                    <input
                                                        type="text"
                                                        className="item-input large-input"
                                                        value={item}
                                                        onChange={e => handleChange(sectionKey, idx, e.target.value)}
                                                    />
                                                ) : (
                                                    <textarea
                                                        className="regular-textarea"
                                                        rows={2}
                                                        value={item}
                                                        onChange={e => handleChange(sectionKey, idx, e.target.value)}
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn-remove-item"
                                                    onClick={() => handleRemoveItem(sectionKey, idx)}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        ))}

                                        {/* Bouton + Ajouter */}
                                        <button
                                            type="button"
                                            className="btn-add-item"
                                            onClick={() => handleAddItem(sectionKey)}
                                        >
                                            + Ajouter
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="edit-actions">
                <button onClick={onBack} className="btn btn-secondary">Aperçu</button>
                <button onClick={onGenerate} className="btn btn-primary">
                    Générer le CV en PDF
                </button>
            </div>
        </div>
    );
};

export default EditPage;
