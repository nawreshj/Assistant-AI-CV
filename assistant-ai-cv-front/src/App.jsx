import React, {useState} from 'react';
import "./styles/App.css";
import {Routes, Route, useNavigate} from 'react-router-dom';
import GeneratePage from './pages/GeneratePage';
import './styles/App.css';
import PreviewPage from "./pages/PreviewPage.jsx";
import EditPage from "./pages/EditPage.jsx";

function App() {
    const [structuredCV, setStructuredCV] = useState(null);
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<GeneratePage setStructuredCV={setStructuredCV} />} />

            <Route
                path="/preview"
                element={
                    <PreviewPage
                        structuredCV={structuredCV}
                        onReset={() => navigate('/')}
                        onEdit={() => navigate('/edit')}
                    />
                }
            />

            <Route
                path="/edit"
                element={
                    <EditPage
                        structuredCV={structuredCV}
                        onChange={setStructuredCV}
                        onBack={() => alert("TODO : generer pdf ")}
                        onGenerate={() => alert("TODO : Générer le PDF")}
                    />
                }
            />
        </Routes>
    );
}

export default App;

