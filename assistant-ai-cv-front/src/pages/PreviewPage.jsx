import React from 'react';
import "../styles/PreviewPage.css";

function PreviewPage({ structuredCV, onReset }) {
    const renderSection = (section) => {
        if (!section || !section.items || section.items.length === 0) return null;
        return (
            <div className="cv-section">
                <h3>{section.title}</h3>
                <ul>
                    {section.items.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="preview-container">
            <h2>{structuredCV.cv_title}</h2>
            <h3>{structuredCV.full_name}</h3>
            <p className="contact-block">{structuredCV.contact_block}</p>
            <p className="profile">{structuredCV.profile}</p>

            {renderSection(structuredCV.skills)}
            {renderSection(structuredCV.soft_skills)}
            {renderSection(structuredCV.languages)}
            {renderSection(structuredCV.experiences)}
            {renderSection(structuredCV.educations)}
            {renderSection(structuredCV.projects)}
            {renderSection(structuredCV.certifications)}
            {renderSection(structuredCV.hobbies)}

            <div className="button-container">
                <button onClick={onReset}>Modifier le CV</button>
                <button className="pdf-button">Générer le CV en PDF</button>
            </div>
        </div>
    );
}

export default PreviewPage;
