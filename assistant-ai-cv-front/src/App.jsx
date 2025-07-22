// src/App.jsx
import React, { useState, useEffect } from 'react';

export default function App() {
    const [dark, setDark] = useState(false);
    useEffect(() => {
        // lire la préférence stockée
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
            setDark(true);
        }
    }, []);
    const toggle = () => {
        if (dark) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
        setDark(!dark);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center
                    bg-white text-black dark:bg-gray-900 dark:text-white
                    transition-colors duration-300">
            <button
                onClick={toggle}
                className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
                {dark ? '💡 Mode clair' : '🌙 Mode sombre'}
            </button>
            <div className="p-10 bg-gray-100 dark:bg-gray-800 rounded">
                ✔️ Si ce bloc bascule, ton dark mode est prêt !
            </div>
        </div>
    );
}
