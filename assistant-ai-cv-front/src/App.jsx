import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import Loading from './components/Loading';
import PreviewPage from './pages/PreviewPage';
import "./styles/App.css";
import { getExtractionText } from "./api/extractionAPI.jsx";
import { getExtractionGpt, getReformulationGpt } from "./api/gptApi.jsx";

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [structuredCV, setStructuredCV] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError('');
        setStructuredCV(null);

        try {
            const [cvText, offerText] = await getExtractionText(formData);
            const { cvData, offerData } = await getExtractionGpt({ cvText, offerText });
            const { structuredCV } = await getReformulationGpt({ cvData, offerData });
            setStructuredCV(structuredCV);
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

            {!isLoading && !structuredCV && !error && (
                <UploadForm onSubmit={handleSubmit} />
            )}

            {!isLoading && structuredCV && (
                <PreviewPage structuredCV={structuredCV} onReset={() => setStructuredCV(null)} />
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
