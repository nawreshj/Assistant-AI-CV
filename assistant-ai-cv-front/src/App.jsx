import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import Loading from './components/Loading';
import "./styles/App.css";
import {getExtractionText} from "./api/extractionAPI.jsx";
import {getExtractionGpt, getReformulationGpt} from "./api/gptApi.jsx";

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [reformulatedResume, setReformulatedResume] = useState('');
    const [error, setError] = useState('');
    const [editableResume, setEditableResume] = useState('');



    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError('');
        setReformulatedResume('');

        try {
            // Etape 1 : extraire les textes bruts
            const [cvText, offerText] = await getExtractionText(formData);

            // Étape 2 : envoyer les textes bruts
            const { cvData, offerData } = await getExtractionGpt({cvText,offerText});

            // Étape 3 : envoyer les données structurées pour reformulation
            const { reformulatedResume } = await getReformulationGpt({cvData,offerData});

            setReformulatedResume(reformulatedResume);
            setEditableResume(reformulatedResume);

        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue pendant le traitement.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="App">
            {isLoading && <Loading/>}

            {!isLoading && !reformulatedResume && !error && (
                <UploadForm onSubmit={handleSubmit}/>
            )}

            {!isLoading && reformulatedResume && (
                <div className="result-container">
                    <h2>CV personnalisé généré :</h2>
                    <textarea
                        className="editable-cv"
                        value={editableResume}
                        onChange={(e) => setEditableResume(e.target.value)}
                        rows={20}
                    />
                    <button className="reset-button" onClick={() => {
                        setReformulatedResume('');
                        setError('');
                    }}>
                        🔄 Recommencer
                    </button>
                </div>
            )}

            {!isLoading && error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

    export default App;
