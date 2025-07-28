// src/theme.js
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

// Configuration de base pour le mode
const config = {
    initialColorMode: "light", // ou "dark" si tu préfères
    useSystemColorMode: false,
};

const styles = {
    global: (props) => ({
        body: {
            bg: mode("white", "gray.900")(props),
            color: mode("gray.800", "whiteAlpha.900")(props),
        },
    }),
};

// Tu peux ici ajouter des couleurs custom, typographies, etc.
const theme = extendTheme({
    config,
    styles,
    colors: {
        brand: {
            500: "#3182CE", // bleu par défaut
        },
    },
});

export default theme;
