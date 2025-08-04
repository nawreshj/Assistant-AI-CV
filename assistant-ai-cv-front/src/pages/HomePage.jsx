import React from "react";
import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Image,
    HStack,
} from "@chakra-ui/react";
import Nav from "../components/Nav";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    const steps = [
        { emoji: "🧠", label: "Lecture du CV" },
        { emoji: "🔍", label: "Analyse de l’offre" },
        { emoji: "✍️", label: "Création du nouveau CV" },
    ];

    return (
        <Box pos="absolute" inset="0" bg="background" color="text" overflow="hidden">
            <Nav />

            <VStack spacing={6} align="center" justify="center" h="100%" px={4} py={10} textAlign="center">
                {/* Mascotte centrée + remontée */}
                <Box mt={{ base: "-20px", md: "-40px" }} mb={2}>
                    <Image
                        src="/mascotte.png"
                        alt="Mascotte IA"
                        boxSize={{ base: "130px", md: "200px" }}
                        objectFit="contain"
                    />
                </Box>

                {/* Titre */}
                <Heading size="2xl" fontWeight="bold">
                    🎯 Un CV sur-mesure pour chaque offre
                </Heading>

                {/* Description */}
                <Text fontSize="lg" maxW="600px" color="subtext">
                    Fini les candidatures copiées-collées.
                    <br />
                    Laisse notre assistant IA adapter automatiquement ton CV à l’annonce.
                </Text>

                {/* Bouton stylisé */}
                <Button
                    colorScheme="blue"
                    size="lg"
                    px={10}
                    py={6}
                    fontSize="md"
                    rounded="full"
                    shadow="md"
                    _hover={{ transform: "scale(1.05)" }}
                    onClick={() => navigate("/generate")}
                >
                    Commencer
                </Button>


                {/* Étapes */}
                <HStack spacing={4} pt={8} flexWrap="wrap" justify="center">
                    {steps.map((item, i) => (
                        <Box
                            key={i}
                            px={4}
                            py={2}
                            bg="step"
                            rounded="full"
                            transition="all 0.3s"
                            _hover={{ bg: "accent", color: "white", transform: "scale(1.05)" }}
                        >
                            <Text fontSize="sm">
                                {item.emoji} {item.label}
                            </Text>
                        </Box>
                    ))}
                </HStack>
            </VStack>
        </Box>
    );
}
