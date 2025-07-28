// src/components/Nav.jsx
import {
    Box,
    Flex,
    Text,
    Button,
    Stack,
    useColorMode,
    useColorModeValue,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Nav() {
    const { colorMode, toggleColorMode } = useColorMode()
    const bgColor = useColorModeValue('gray.100', 'gray.900')
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <Box bg={bgColor} px={4} w="100%">
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                {/* Accueil si on n’est pas sur / */}
                {location.pathname !== '/' ? (
                    <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
                        Accueil
                    </Button>
                ) : (
                    <Box w="70px" /> // espace vide pour équilibrer
                )}

                {/* Titre */}
                <Text fontWeight="bold" fontSize="lg" textAlign="center">
                    CV AI Optimizer
                </Text>

                {/* Mode clair/sombre */}
                <Stack direction="row" align="center">
                    <Button onClick={toggleColorMode} size="sm" variant="ghost">
                        {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    </Button>
                </Stack>
            </Flex>
        </Box>
    )
}
