// src/pages/GeneratePage.jsx
import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import Loading from '../components/Loading';
import { getExtractionText } from '../api/extractionAPI';
import { getExtractionGpt, getReformulationGpt } from '../api/gptApi';
import { useNavigate } from 'react-router-dom';

const GeneratePage = ({ setStructuredCV }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError('');

        try {
            const [cvText, offerText] = await getExtractionText(formData);
            const { cvData, offerData } = await getExtractionGpt({ cvText, offerText });
            const { structuredCV } = await getReformulationGpt({ cvData, offerData });

            setStructuredCV(structuredCV);// On stocke le résultat dans App
            console.log("Tentative de direction ver previewpage");
            navigate('/preview');// On redirige vers la page d’aperçu
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue pendant le traitement.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            {isLoading && <Loading />}

            {!isLoading && (
                <UploadForm onSubmit={handleSubmit} />
            )}

            {!isLoading && error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default GeneratePage;
