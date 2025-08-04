// src/components/Loading.jsx
import React from 'react';
import { VStack, Spinner, Text } from '@chakra-ui/react';

export default function Loading() {
    return (

        <VStack
            spacing={4}
            align="center"
            justify="center"
            h="100vh"
            bg="background"   // token sémantique
            color="text"      // token sémantique
            p={4}
        >
            {/* Spinner principal */}
            <Spinner
                size="xl"           // taille du spinner
                thickness="8px"     // épaisseur de l'anneau
                speed="0.80s"       // vitesse de rotation
                color="brand.500"   // ton bleu principal défini en theme.js
            />

            {/* Textes */}
            <Text fontSize="lg" fontWeight="bold">
                Matching en cours ...
            </Text>
            <Text textAlign="center">
                Nous analysons les documents pour créer le CV sur-mesure a l'offre.
            </Text>
        </VStack>
    );
}
