// src/components/Nav.jsx
import { Box, Button, Flex, Text, Icon, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();

    // ici on définit deux couleurs : une pour le mode clair, l’autre pour le mode sombre
    const bg = useColorModeValue("gray.50", "gray.800");
    const color = useColorModeValue("gray.900", "white");

    return (
        <Box bg={bg} color={color} px={4} py={2} w="100%">
            <Flex justify="space-between" align="center">
                <Text fontWeight="bold" fontSize="lg">
                    CV AI Optimizer
                </Text>

                <Button onClick={toggleColorMode} size="sm" variant="ghost">
                    <Icon as={colorMode === "light" ? FaMoon : FaSun} boxSize={5} />
                </Button>
            </Flex>
        </Box>
    );
}
