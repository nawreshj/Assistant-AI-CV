// src/pages/GeneratePage.jsx
import React, { useState } from 'react';
import {
    Box,
    Center,
    Text,
    Image,
    Heading
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import UploadForm from '../components/UploadForm';
import Loading from '../components/Loading';
import { getExtractionText } from '../api/extractionAPI';
import { getExtractionGpt, getReformulationGpt } from '../api/gptApi';

export default function GeneratePage({ setStructuredCV }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]       = useState('');
    const navigate               = useNavigate();

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setError('');

        try {
            const [cvText, offerText] = await getExtractionText(formData);
            const { cvData, offerData } = await getExtractionGpt({ cvText, offerText });
            const { structuredCV } = await getReformulationGpt({ cvData, offerData });

            setStructuredCV(structuredCV);
            navigate('/preview');
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue pendant le traitement.");
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <Box pos="absolute" inset="0" bg="background" color="text" overflow="hidden">
            <Nav />
            {isLoading ? (

                // —— Affiche uniquement le loader ——
                <Center h="100vh">
                    <Loading />
                </Center>
            ) : (
                // —— Affiche le reste de la page ——
                <>


                    <Center mt={{ base: 15, md: 18 }}>
                        <Image
                            src="/mini-mascotte.png"
                            alt="Mascotte CV AI Optimizer"
                            boxSize={{ base: '100px', md: '150px' }}
                            objectFit="contain"
                        />
                    </Center>

                    <Heading
                        as="h1"
                        size="lg"
                        textAlign="center"
                        mt={4}
                        mb={6}
                    >
                        Générez un CV sur mesure avec l’IA
                    </Heading>

                    <Box mt={{ base: 4, md: 6 }} maxW="6xl" mx="auto">
                        <UploadForm onSubmit={handleSubmit} />
                    </Box>

                    {error && (
                        <Text color="red.500" mt={4} textAlign="center">
                            {error}
                        </Text>
                    )}
                </>
            )}
        </Box>
    );
}
