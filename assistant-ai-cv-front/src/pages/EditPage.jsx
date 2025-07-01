// EditPage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/EditPage.css';

const specialSections = ['languages', 'skills', 'soft_skills', 'hobbies'];

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

    const labelFor = key => {
        switch (key) {
            case 'full_name': return 'Nom complet';
            case 'cv_title':  return 'Titre du CV';
            case 'profile':   return 'Profil';
            default:
                return structuredCV[key]?.title || key;
        }
    };

    return (
        <div className="edit-container">
            <h2>✏️ Modifier le CV</h2>

            {Object.entries(structuredCV).map(([sectionKey, sectionValue]) => (
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
                                        size={100}
                                        value={sectionValue}
                                        onChange={e => handleChange(sectionKey, null, e.target.value)}
                                    />
                                )
                            )}

                            {/* Sections à items */}
                            {sectionValue && typeof sectionValue === 'object' && 'items' in sectionValue && (
                                <>
                                    {/* Label avant modification du titre de section */}
                                    <label
                                        htmlFor={`${sectionKey}-title`}
                                        className="section-title-label"
                                    >
                                        Modifier le titre :
                                    </label>
                                    <input
                                        id={`${sectionKey}-title`}
                                        className="section-title long-input"
                                        type="text"
                                        size={100}
                                        value={sectionValue.title}
                                        onChange={e => handleChange(sectionKey, 'title', e.target.value)}
                                    />

                                    {sectionValue.items.map((item, idx) => (
                                        specialSections.includes(sectionKey) ? (
                                            <input
                                                key={idx}
                                                type="text"
                                                className="item-input large-input"
                                                value={item}
                                                onChange={e => handleChange(sectionKey, idx, e.target.value)}
                                            />
                                        ) : (
                                            <textarea
                                                key={idx}
                                                className="regular-textarea"
                                                rows={3}
                                                value={item}
                                                onChange={e => handleChange(sectionKey, idx, e.target.value)}
                                            />
                                        )
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="edit-actions">
                <button onClick={onBack} className="btn btn-secondary">Retour</button>
                <button onClick={onGenerate} className="btn btn-primary">Générer le CV en PDF</button>
            </div>
        </div>
    );
};

export default EditPage;
