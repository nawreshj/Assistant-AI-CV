import React, { useState } from 'react';
import './styles/App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GeneratePage from './pages/GeneratePage';
import PreviewPage from './pages/PreviewPage.jsx';
import EditPage from './pages/EditPage.jsx';
import { downloadPdf } from './api/pdfApi';

export default function App() {
    const [structuredCV, setStructuredCV] = useState(null);
    const navigate = useNavigate();

    return (
        <Routes>
            {/* Page de génération du CV */}
            <Route
                path="/"
                element={<GeneratePage setStructuredCV={setStructuredCV} />}
            />

            {/* Page de prévisualisation avec passage de onGenerate */}
            <Route
                path="/preview"
                element={
                    <PreviewPage
                        structuredCV={structuredCV}
                        onEdit={() => navigate('/edit')}
                        onGenerate={() => downloadPdf(structuredCV)}
                        onReset={() => navigate('/')}
                    />
                }
            />

            {/* Page d'édition, on peut également réutiliser downloadPdf si désiré */}
            <Route
                path="/edit"
                element={
                    <EditPage
                        structuredCV={structuredCV}
                        onChange={setStructuredCV}
                        onBack={() => navigate('/preview')}
                        onGenerate={() => downloadPdf(structuredCV)}
                    />
                }
            />
        </Routes>
    );
}
