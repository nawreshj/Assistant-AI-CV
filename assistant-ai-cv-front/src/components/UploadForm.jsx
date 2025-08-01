// src/components/UploadForm.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Stack,
    Heading,
    Text,
    Button,
    Textarea,
    Icon,
} from '@chakra-ui/react';
import { LuUpload } from 'react-icons/lu';

export default function UploadForm({ onSubmit }) {
    const [file, setFile] = useState(null);
    const [offerText, setOfferText] = useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !offerText.trim()) {
            alert("Veuillez fournir un CV et une offre d'emploi.");
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('offerText', offerText);
        onSubmit(formData);
    };

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            maxW="4xl"
            mx="auto"
            p={{ base: 4, md: 8 }}
            bg={{ base: 'gray.50', _dark: 'gray.700' }}
            borderWidth={1}
            borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
            borderRadius="md"
            boxShadow="sm"
        >
            <Stack spacing={6} align="stretch">
               

                <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    align="flex-start"
                >
                    {/* Zone de dépôt du CV */}
                    <Box flex={1}>
                        <Text fontWeight="semibold" mb={2}>
                            Uploadez votre CV
                        </Text>
                        <Box
                            {...getRootProps()}
                            p={8}
                            border="2px dashed"
                            borderColor={{ base: 'gray.300', _dark: 'gray.500' }}
                            borderRadius="md"
                            textAlign="center"
                            cursor="pointer"
                            bg={{ base: 'white', _dark: 'gray.800' }}
                        >
                            <Icon as={LuUpload} boxSize={8} mb={2} color="gray.400" />
                            {isDragActive
                                ? <Text>Déposez le fichier ici…</Text>
                                : <Text>Glissez & déposez ou cliquez pour sélectionner</Text>
                            }
                            {file && <Text mt={2}>📎 {file.name}</Text>}
                            <input {...getInputProps()} />
                        </Box>
                    </Box>

                    {/* Zone de texte de l'offre et bouton */}
                    <Box flex={1}>
                        <Text fontWeight="semibold" mb={2}>
                            Copier-coller l'offre d'emploi
                        </Text>
                        <Textarea
                            rows={10}
                            placeholder="Collez ici le texte de l'offre d'emploi"
                            value={offerText}
                            onChange={(e) => setOfferText(e.target.value)}
                            bg={{ base: 'white', _dark: 'gray.800' }}
                            borderColor={{ base: 'gray.300', _dark: 'gray.500' }}
                            _placeholder={{ color: { base: 'gray.500', _dark: 'gray.400' } }}
                        />
                        <Button
                            type="submit"
                            mt={4}
                            colorScheme="blue"
                            size="md"
                            isFullWidth
                        >
                            Générer votre nouveau CV
                        </Button>
                    </Box>
                </Stack>
            </Stack>
        </Box>
    );
}
