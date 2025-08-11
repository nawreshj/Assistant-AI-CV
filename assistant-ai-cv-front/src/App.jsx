import React, { useState } from 'react';
import './styles/App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import GeneratePage from './pages/GeneratePage';
import PreviewPage from './pages/PreviewPage.jsx';
import EditPage from './pages/EditPage.jsx';
import { downloadPdf } from './api/pdfApi';
import HomePage from "./pages/HomePage.jsx";

export default function App() {
    const [structuredCV, setStructuredCV] = React.useState(null);
    const [structuredOffer, setStructuredOffer] = React.useState(null);
    const navigate = useNavigate();

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generate" element={<GeneratePage setStructuredCV={setStructuredCV} setStructuredOffer={setStructuredOffer}/>} />
                <Route
                    path="/preview"
                    element={
                        <PreviewPage
                            structuredCV={structuredCV}
                            structuredOffer={structuredOffer}
                            onEdit={() => navigate('/edit')}
                            onGenerate={() => downloadPdf(structuredCV)}
                            onReset={() => {                            // ⬅️ reset propre
                                setStructuredCV(null);
                                setStructuredOffer(null);
                                navigate('/generate');
                            }}                        />
                    }
                />
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

        </div>
    );
}
