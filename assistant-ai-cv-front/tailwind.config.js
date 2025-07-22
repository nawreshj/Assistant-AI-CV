// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    // Où Tailwind va scanner tes classes
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    // On active le dark mode via une classe `dark` sur <html>
    darkMode: 'class',
    theme: {
        extend: {},      // ici tu pourras ajouter tes couleurs/customizations
    },
    plugins: [],
}
