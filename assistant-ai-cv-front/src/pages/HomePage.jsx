// Étape 1 : structure de base avec 2 colonnes (layout responsive)
import React from "react";
import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useThemeMode } from "../context/ThemeContext";

export default function HomePage() {
    const navigate = useNavigate();
    const { theme } = useThemeMode();

    return (
        <Box
            bg={theme.bg}
            color={theme.color}
            h="100vh"
            w="100vw"
            m="0"
            p="0"
            position="absolute"
            overflow="hidden"
            transition="background-color 0.3s"
        >
            {/* Bouton pour changer de thème */}
            <Box position="absolute" top="4" right="4">
                <ThemeToggleButton />
            </Box>

            {/* Layout principal : deux colonnes */}
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
                minH="100vh"
                px={{ base: 6, md: 16 }}
                py={{ base: 10, md: 0 }}
                gap={10}
            >
                {/* Colonne gauche : texte */}
                <Box flex="1" textAlign={{ base: "center", md: "left" }}>
                    <Heading size="2xl" mb="4">
                        CV AI Optimizer
                    </Heading>
                    <Text fontSize="lg" mb="6">
                        Un assistant intelligent pour adapter ton CV à chaque offre d’emploi.
                    </Text>
                    <Text fontSize="md" mb="6">
                        Fini les candidatures génériques. <br />
                        Personnalise ton CV en un clic et attire l’attention des recruteurs.
                    </Text>
                    <Button colorScheme="blue" size="lg" onClick={() => navigate("/generate")}>Commencer</Button>
                </Box>

                {/* Colonne droite : image mascotte */}
                <Box flex="1" display="flex" justifyContent="center">
                    <Image
                        src="/mascotte.png"
                        alt="Mascotte IA"
                        boxSize={{ base: "200px", md: "300px" }}
                        objectFit="contain"
                    />
                </Box>
            </Flex>
        </Box>
    );
}
