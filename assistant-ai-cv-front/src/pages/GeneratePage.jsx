// src/pages/GeneratePage.jsx
import React, { useState } from 'react';
import { Box, Center, Text } from '@chakra-ui/react';
import UploadForm from '../components/UploadForm';
import Loading from '../components/Loading';
import { getExtractionText } from '../api/extractionAPI';
import { getExtractionGpt, getReformulationGpt } from '../api/gptApi';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';

const GeneratePage = ({ setStructuredCV }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
        <Box
            pos="absolute"     // position absolute par rapport à l’écran
            inset="0"          // top:0 right:0 bottom:0 left:0
            bg="background"
            color="text"
            overflow="hidden"  // empêche le scroll si un enfant déborde
        >
            <Nav />
            {isLoading && (
                <Center h="full">
                    <Loading />
                </Center>
            )}

            {!isLoading &&
                <Box pt={{ base: 0, md: 0 }} maxW="6xl" mx="auto">
                    <UploadForm onSubmit={handleSubmit} />
                </Box>

            }

            {!isLoading && error && (
                <Text color="red.500" mt={4} textAlign="center">
                    {error}
                </Text>
            )}
        </Box>
    );
};

export default GeneratePage;
