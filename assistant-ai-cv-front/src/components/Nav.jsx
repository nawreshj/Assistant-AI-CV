// src/components/Nav.jsx
import { Box, Button, Flex, Text, Icon } from "@chakra-ui/react";
import { useTheme as useNextTheme } from "next-themes";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Nav() {
    const { theme, setTheme } = useNextTheme(); // "light" ou "dark"

    return (
        <Box bg="background" color="text" px={4} py={2} w="100%">
            <Flex justify="space-between" align="center">
                {/* Titre de l'app */}
                <Text fontWeight="bold" fontSize="lg">
                    CV AI Optimizer
                </Text>

                {/* Bouton light/dark */}
                <Button
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    size="sm"
                    variant="ghost"
                >
                    <Icon as={theme === "light" ? FaMoon : FaSun} boxSize={5} />
                </Button>
            </Flex>
        </Box>
    );
}
