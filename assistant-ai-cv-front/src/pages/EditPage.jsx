import React from 'react';
import '../styles/EditPage.css';

const EditPage = ({ structuredCV, onChange, onBack, onGenerate }) => {
    const handleChange = (section, key, value) => {
        const updated = { ...structuredCV };

        if (typeof updated[section] === 'object' && updated[section] !== null && 'items' in updated[section]) {
            if (key === 'title') {
                updated[section].title = value;
            } else {
                updated[section].items[key] = value;
            }
        } else {
            updated[section] = value;
        }

        onChange(updated);
    };

    return (
        <div className="edit-container">
            <h2>✏️ Modifier le CV</h2>

            <div className="edit-section">
                <label>Nom complet :</label>
                <input
                    type="text"
                    value={structuredCV.full_name}
                    onChange={(e) => handleChange('full_name', null, e.target.value)}
                />
            </div>

            <div className="edit-section">
                <label>Titre du CV :</label>
                <input
                    type="text"
                    value={structuredCV.cv_title}
                    onChange={(e) => handleChange('cv_title', null, e.target.value)}
                />
            </div>

            <div className="edit-section">
                <label>Profil :</label>
                <textarea
                    value={structuredCV.profile}
                    onChange={(e) => handleChange('profile', null, e.target.value)}
                />
            </div>

            {Object.entries(structuredCV).map(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'items' in value) {
                    return (
                        <div className="edit-section" key={key}>
                            <label>{value.title}</label>
                            <input
                                type="text"
                                value={value.title}
                                onChange={(e) => handleChange(key, 'title', e.target.value)}
                            />
                            {value.items.map((item, index) => (
                                <textarea
                                    key={index}
                                    value={item}
                                    onChange={(e) => handleChange(key, index, e.target.value)}
                                />
                            ))}
                        </div>
                    );
                }
                return null;
            })}

            <div className="edit-actions">
                <button onClick={onBack} className="btn btn-secondary">Retour</button>
                <button onClick={onGenerate} className="btn btn-primary">Générer le CV en PDF</button>
            </div>
        </div>
    );
};

export default EditPage;
