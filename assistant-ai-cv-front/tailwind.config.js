// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",           // votre template
        "./src/**/*.{js,jsx,ts,tsx}"  // tous vos composants React
    ],
    darkMode: 'class',         // activation du mode sombre par classe
    theme: {
        extend: {},               // ici vos personnalisations futures
    },
    plugins: [],
}
