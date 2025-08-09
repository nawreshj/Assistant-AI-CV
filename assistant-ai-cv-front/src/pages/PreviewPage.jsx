// src/pages/PreviewPage.jsx
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Stack,
    Button,
} from '@chakra-ui/react';
import Nav from '../components/Nav';
import CvPreview from '../components/CvPreview';

export default function PreviewPage({ structuredCV, onEdit, onGenerate, onReset }) {
    const navigate = useNavigate();

    // Si pas de données, on renvoie vers /generate
    useEffect(() => {
        if (!structuredCV) navigate('/generate');
    }, [structuredCV, navigate]);

    if (!structuredCV) return null;

    return (
        <Box pos="absolute" inset="0" bg="background" color="text" overflow="auto">
            {/* Header commun */}
            <Nav />

            <Container maxW="6xl" py={{ base: 6, md: 10 }}>
                <Heading size="lg" textAlign="center" mb={{ base: 4, md: 6 }}>
                    Aperçu du CV
                </Heading>

                {/* Cadre d’aperçu (adapte les couleurs en dark) */}
                {/* Feuille A4 centrée, fidèle au rendu initial */}
                <Box display="flex" justifyContent="center" mt={{ base: 4, md: 6 }}>
                    <Box
                        // A4 ~ 794×1123 @96dpi. En mobile: width = 90vw, height = width*1.414
                        w={{ base: 'min(90vw, 794px)', md: '794px' }}
                        h={{ base: 'calc(min(90vw, 794px) * 1.414)', md: '1123px' }}
                        bg="white"                 // toujours blanc pour la feuille, même en dark
                        color="black"              // texte noir dans la feuille
                        borderWidth="1px"
                        borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
                        boxShadow="md"
                        overflow="hidden"
                    >
                        <CvPreview structuredCV={structuredCV} />
                    </Box>
                </Box>


                {/* Boutons d’action */}
                <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    spacing={4}
                    justify="center"
                    mt={{ base: 6, md: 8 }}
                >
                    <Button variant="outline" onClick={onEdit}>
                        Modifier le CV
                    </Button>
                    <Button colorScheme="blue" onClick={onGenerate}>
                        Générer le CV en PDF
                    </Button>
                    <Button colorScheme="red" variant="ghost" onClick={onReset}>
                        Recommencer
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}

PreviewPage.propTypes = {
    structuredCV: PropTypes.object,
    onEdit:       PropTypes.func.isRequired,
    onGenerate:   PropTypes.func.isRequired,
    onReset:      PropTypes.func.isRequired,
};
