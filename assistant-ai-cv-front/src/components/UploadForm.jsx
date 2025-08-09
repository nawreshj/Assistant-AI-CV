// src/components/UploadForm.jsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Stack,
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
            bg="card"                 // carte: blanc (light) / gris .700 (dark)
            color="text"
            borderWidth={1}
            borderColor="step"        // token de bordure
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
                        <Text fontWeight="semibold" mb={2} color="text">
                            Uploadez votre CV
                        </Text>
                        <Box
                            {...getRootProps()}
                            p={8}
                            border="2px dashed"
                            borderColor="step"
                            borderRadius="md"
                            textAlign="center"
                            cursor="pointer"
                            bg="card"             // suit le mode (cohérent avec la carte)
                        >
                            <Icon as={LuUpload} boxSize={8} mb={2} color="subtext" />
                            {isDragActive
                                ? <Text>Déposez le fichier ici…</Text>
                                : <Text color="subtext">Glissez & déposez ou cliquez pour sélectionner</Text>
                            }
                            {file && <Text mt={2}>📎 {file.name}</Text>}
                            <input {...getInputProps()} />
                        </Box>
                    </Box>

                    {/* Zone de texte de l'offre et bouton */}
                    <Box flex={1}>
                        <Text fontWeight="semibold" mb={2} color="text">
                            Copier-coller l'offre d'emploi
                        </Text>
                        <Textarea
                            rows={10}
                            placeholder="Collez ici le texte de l'offre d'emploi"
                            value={offerText}
                            onChange={(e) => setOfferText(e.target.value)}
                            bg="card"
                            borderColor="step"
                            _placeholder={{ color: 'subtext' }}
                        />
                        <Button
                            type="submit"
                            mt={4}
                            bg="accent"           // bouton suit le thème
                            color="buttonText"
                            _hover={{ filter: 'brightness(1.05)' }}
                            _active={{ filter: 'brightness(0.98)' }}
                            size="md"
                            width="100%"
                        >
                            Générer votre nouveau CV
                        </Button>
                    </Box>
                </Stack>
            </Stack>
        </Box>
    );
}
