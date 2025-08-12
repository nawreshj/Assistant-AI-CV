import { Box, Button, Flex, Text, Icon, Image, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();

    const bg = useColorModeValue("white", "gray.800");
    const color = useColorModeValue("gray.900", "white");

    return (
        <Box bg={bg} color={color} px={4} py={2} w="100%">
            <Flex justify="space-between" align="center">

                <Flex
                    align="center"
                    cursor="pointer"
                    onClick={() => navigate("/")}
                >
                    <Image
                        src="/mini-mascotte.png"     // chemin vers ton logo
                        alt="Logo"
                        boxSize="30px"
                        objectFit="contain"
                    />
                    <Text fontWeight="bold" fontSize="lg" mr={2}>
                        CV Assistant AI
                    </Text>

                </Flex>


                <Button onClick={toggleColorMode} size="sm" variant="ghost">
                    <Icon as={colorMode === "light" ? FaMoon : FaSun} boxSize={5} />
                </Button>
            </Flex>
        </Box>
    );
}
