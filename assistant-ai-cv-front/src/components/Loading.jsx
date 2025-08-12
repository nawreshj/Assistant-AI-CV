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
            bg="background"
            color="text"
            p={4}
        >

            <Spinner
                size="xl"
                thickness="8px"
                speed="0.80s"
                color="brand.500"
            />


            <Text fontSize="lg" fontWeight="bold">
                Matching en cours ...
            </Text>
            <Text textAlign="center">
                Nous analysons les documents pour créer le CV sur-mesure a l'offre.
            </Text>
        </VStack>
    );
}
