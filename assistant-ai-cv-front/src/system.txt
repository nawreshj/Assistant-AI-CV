// src/system.js
import { createSystem, defaultConfig } from "@chakra-ui/react";

const system = createSystem(defaultConfig, {
    // tokens : couleurs, typographies, etc.
    theme: {
        tokens: {
            colors: {
                background: { value: "#ffffff" },
                text:       { value: "#1a202c" },
                primary:    { value: "#3182CE" },
            },
        },
        // semanticTokens pour switch clair / sombre
        semanticTokens: {
            colors: {
                background: {
                    value: { base: "{colors.background}", _dark: "#1a202c" },
                },
                text: {
                    value: { base: "{colors.text}", _dark: "#ffffff" },
                },
            },
        },
        // ici tu peux ajouter des recipes, etc.
    },
});

export default system;
