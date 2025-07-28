import React from "react";
import { Button } from "@chakra-ui/react";
import { useThemeMode } from "../context/ThemeContext";

export default function ThemeToggleButton({ position = "absolute" }) {
    const { isDark, setIsDark, theme } = useThemeMode();

    return (
        <Button
            position={position}
            top="20px"
            right="20px"
            size="sm"
            bg={theme.buttonBg}
            color={theme.color}
            _hover={{ opacity: 0.8 }}
            onClick={() => setIsDark(!isDark)}
            zIndex="10"
        >
            {isDark ? "☀️ Mode clair" : "🌙 Mode sombre"}
        </Button>
    );
}
