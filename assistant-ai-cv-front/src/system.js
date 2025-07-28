import { createSystem, defaultConfig } from '@chakra-ui/react';

export const system = createSystem(defaultConfig, {
    theme: {
        tokens: {
            colors: {
                brand: { value: '#2B6CB0' },
                background: { value: '#f7fafc' },
                foreground: { value: '#1a202c' },
            },
            fonts: {
                body: { value: 'system-ui, sans-serif' },
                heading: { value: 'Georgia, serif' },
            },
        },
        recipes: {
            button: {
                base: {
                    bg: 'brand',
                    color: 'white',
                    px: '4',
                    py: '2',
                    borderRadius: 'md',
                },
            },
        },
    },
});
