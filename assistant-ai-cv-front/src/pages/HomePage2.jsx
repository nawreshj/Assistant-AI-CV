import React from "react";
import { Box, Flex, Heading, Text, Button, Image } from "@chakra-ui/react";
import Nav from "../components/Nav";

export default function HomePage() {
    return (
        <Box minH="100vh" bg="background" color="text" pt={16}>
            <Nav />

            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
                px={6}
                py={10}
                gap={10}
            >
                <Box flex="1" textAlign={{ base: "center", md: "left" }}>
                    <Heading size="2xl" mb="4">
                        🎯 Générez un CV unique pour chaque offre
                    </Heading>
                    <Text fontSize="lg" mb="6">
                        Fini les candidatures copiées-collées.
                        <br />
                        Notre assistant IA adapte ton CV à chaque annonce pour maximiser tes chances d’être recruté.
                    </Text>
                    <Button colorScheme="blue" size="lg" onClick={() => console.log("go generate")}>
                        Commencer
                    </Button>
                </Box>

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
