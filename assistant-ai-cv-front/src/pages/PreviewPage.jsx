import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';import PropTypes from 'prop-types';
import '../styles/PreviewPage.css';
import CvPreview from '../components/CvPreview';

/**
 * Page de prévisualisation du CV.
 * Affiche un aperçu fidèle du CV via un <iframe> encapsulé,
 * puis propose les actions de modification, génération et réinitialisation.
 */
function PreviewPage({ structuredCV, onEdit, onGenerate, onReset }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!structuredCV) {
            navigate('/generate');
        }
    }, [structuredCV, navigate]);
    if (!structuredCV) return null;
    return (
        <div className="preview-page">
            {/* Aperçu du CV dans un cadre iframe */}
            <div className="cv-frame-container">
                <CvPreview structuredCV={structuredCV} />
            </div>

            {/* Boutons d'action */}
            <div className="button-container">
                <button onClick={onEdit} className="btn btn-secondary">
                    Modifier le CV
                </button>
                <button onClick={onGenerate} className="btn btn-primary pdf-button">
                    Générer le CV en PDF
                </button>
                <button onClick={onReset} className="btn btn-danger">
                    Recommencer
                </button>
            </div>
        </div>
    );
}

PreviewPage.propTypes = {
    structuredCV: PropTypes.object,
    onEdit:       PropTypes.func.isRequired,
    onGenerate:   PropTypes.func.isRequired,
    onReset:      PropTypes.func.isRequired,
};

export default PreviewPage;
