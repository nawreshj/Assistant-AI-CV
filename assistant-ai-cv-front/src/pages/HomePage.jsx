import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../components/Button.jsx";

export default function HomePage() {
    const [isDark, setIsDark] = useState(true);
    const navigate = useNavigate();

    console.log("✅ HomePage chargé, isDark :", isDark);

    useEffect(() => {
        document.documentElement.classList.add("dark");
        setIsDark(true);
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.remove("dark");
            setIsDark(false);
        } else {
            html.classList.add("dark");
            setIsDark(true);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col bg-gray-900 text-white transition-colors duration-300">
            {/* Bouton thème en haut à droite */}
            <button
                onClick={toggleTheme}
                className="absolute top-[20px] right-[20px] px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
                {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
            </button>


            {/* Contenu centré */}
            <div className="flex-1 flex items-center justify-center">
                {/* Logo */}
                <img
                    src="/logoApp.png"
                    alt="Logo"
                    className="
                        relative                /* active le positionnement relatif */
                        top-[-150px]            /* déplace l’élément de 150px vers le haut */
                        w-48 h-48 md:w-64 md:h-64
                        object-contain
                      "
                />

                {/* Texte en bas à gauche */}
                <div className="absolute bottom-[150px] left-10 max-w-md">

                    <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                        🚀 <span>CV AI Optimizer</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-300 mb-6">
                        Personnalisez votre CV automatiquement selon une offre d'emploi.<br/>
                        Gagnez du temps et augmentez vos chances de décrocher un entretien.
                    </p>
                    <Button onClick={() => navigate('/generate')}>
                        Commencer
                    </Button>

                </div>

            </div>
        </div>
    );
}