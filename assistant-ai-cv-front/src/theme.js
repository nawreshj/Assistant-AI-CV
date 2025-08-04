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
    semanticTokens: {
        colors: {
            background: {
                default: "white",
                _dark: "gray.900",
            },
            text: {
                default: "gray.800",
                _dark: "whiteAlpha.900",
            },
            subtext: {
                default: "gray.600",
                _dark: "gray.400",
            },
            card: {
                default: "gray.100",
                _dark: "gray.700",
            },
            accent: {
                default: "blue.500",
                _dark: "blue.300",
            },
            step: {
                default: "gray.200",
                _dark: "gray.600",
            },
            buttonText: {
                default: "white",
                _dark: "gray.900",
            }

        },
    },



});

export default theme;
