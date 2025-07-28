import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        // récupère le thème depuis localStorage s’il existe
        const stored = localStorage.getItem("theme");
        return stored === "dark" ? true : false;
    });

    useEffect(() => {
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    const theme = isDark
        ? {
            bg: "#1a202c",
            color: "#f7fafc",
            textSecondary: "#cbd5e0",
            buttonBg: "#2d3748",
        }
        : {
            bg: "#f7fafc",
            color: "#1a202c",
            textSecondary: "#4a5568",
            buttonBg: "#e2e8f0",
        };

    return (
        <ThemeContext.Provider value={{ isDark, setIsDark, theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeMode() {
    return useContext(ThemeContext);
}
