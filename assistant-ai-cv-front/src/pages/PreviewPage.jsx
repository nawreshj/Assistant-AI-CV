// src/pages/PreviewPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Stack,
    Button,
    HStack,
    Tooltip,
    Skeleton,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
    CircularProgress, CircularProgressLabel,
    Text,
    Divider,
    Progress,
    Tag,
    Wrap, WrapItem,
    useDisclosure,
} from '@chakra-ui/react';
import Nav from '../components/Nav';
import CvPreview from '../components/CvPreview';
import { getMatchScoreWithOffer } from '../api/matchApi';

export default function PreviewPage({ structuredCV, structuredOffer, onEdit, onGenerate, onReset }) {
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fallback sessionStorage si les props sont nulles (refresh, navigation directe, etc.)
    const cvFromStorage = useMemo(() => {
        try { return JSON.parse(sessionStorage.getItem('structuredCV') || 'null'); } catch { return null; }
    }, []);
    const offerFromStorage = useMemo(() => {
        try { return JSON.parse(sessionStorage.getItem('structuredOffer') || 'null'); } catch { return null; }
    }, []);

    const cv = structuredCV ?? cvFromStorage;
    const offer = structuredOffer ?? offerFromStorage;

    // Redirige vers /generate si pas de CV du tout
    useEffect(() => {
        if (!cv) navigate('/generate');
    }, [cv, navigate]);

    const [loading, setLoading] = useState(false);
    const [matchResult, setMatchResult] = useState(null); // { score, breakdown, missing }
    const score = matchResult?.score ?? null;

    // Appel du score offer-based + missing
    useEffect(() => {
        let cancelled = false;
        async function run() {
            // Besoin des deux : CV + offre
            if (!cv || !offer) return;
            setLoading(true);
            try {
                const data = await getMatchScoreWithOffer({ cv, offer });
                if (!cancelled) setMatchResult(data);
            } catch (e) {
                if (!cancelled) setMatchResult(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => { cancelled = true; };
    }, [cv, offer]);

    const breakdownItems = useMemo(() => {
        const b = matchResult?.breakdown || {};
        return [
            { key: 'skills',        label: 'Compétences', value: Math.round((b.skills ?? 0) * 100) },
            { key: 'technologies',  label: 'Technologies', value: Math.round((b.technologies ?? 0) * 100) },
            { key: 'languages',     label: 'Langues', value: Math.round((b.languages ?? 0) * 100) },
            { key: 'soft_skills',   label: 'Soft skills', value: Math.round((b.soft_skills ?? 0) * 100) },
            { key: 'education',     label: 'Éducation', value: Math.round((b.education ?? 0) * 100) },
            { key: 'keywords',      label: 'Mots-clés', value: Math.round((b.keywords ?? 0) * 100) },
        ];
    }, [matchResult]);

    const missing = matchResult?.missing || {};
    const hasMissing =
        (missing.skills?.length ||
            missing.technologies?.length ||
            missing.soft_skills?.length ||
            missing.languages?.length ||
            missing.education?.length ||
            missing.keywords?.length) > 0;

    const scoreColor = useMemo(() => {
        if (score == null) return 'gray';
        if (score >= 75) return 'green';
        if (score >= 50) return 'yellow';
        return 'red';
    }, [score]);

    if (!cv) return null;

    return (
        <Box pos="absolute" inset="0" bg="background" color="text" overflowY="scroll">
            <Nav />

            <Container maxW="6xl" py={{ base: 6, md: 10 }}>
                {/* Titre = Score */}
                <HStack justify="center" spacing={3} mb={{ base: 4, md: 6 }}>
                    {loading ? (
                        <Skeleton height="28px" width="280px" borderRadius="md" />
                    ) : (
                        <Heading size="lg" textAlign="center">
                            {score != null ? `Score de matching : ${score}%` : 'Score de matching indisponible'}
                        </Heading>
                    )}
                    <Tooltip
                        label={
                            offer
                                ? 'Voir la jauge, le breakdown et les éléments manquants'
                                : "Ajoute d'abord une offre pour obtenir un score"
                        }
                    >
                        <Button
                            size="sm"
                            onClick={onOpen}
                            isDisabled={!offer || loading || score == null}
                            variant="outline"
                        >
                            Détail score
                        </Button>
                    </Tooltip>
                </HStack>

                {/* Aperçu CV */}
                <Box display="flex" justifyContent="center" mt={{ base: 4, md: 6 }}>
                    <Box
                        w={{ base: 'min(88vw, 780px)', md: '780px' }}
                        h={{ base: 'calc(min(88vw, 780px) * 1.414)', md: '580px' }}
                        bg="white"
                        color="black"
                        borderWidth="1px"
                        borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
                        boxShadow="md"
                        overflow="hidden"
                        borderRadius="lg"
                    >
                        <CvPreview structuredCV={cv} />
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

            {/* MODALE DÉTAIL SCORE */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Détail du score</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* Jauge */}
                        <HStack spacing={6} align="center" mb={4}>
                            <CircularProgress
                                value={score ?? 0}
                                color={`${scoreColor}.400`}
                                size="96px"
                                thickness="10px"
                            >
                                <CircularProgressLabel>{score ?? '—'}%</CircularProgressLabel>
                            </CircularProgress>
                            <Box>
                                <Text fontWeight="semibold">Score global d’adéquation</Text>
                                <Text fontSize="sm" color="gray.600">
                                    Calculé par rapport aux exigences de l’offre (offer-based).
                                </Text>
                            </Box>
                        </HStack>

                        <Divider my={3} />

                        {/* Breakdown */}
                        <Box>
                            <Text fontWeight="semibold" mb={2}>Détails par section</Text>
                            <Stack spacing={3}>
                                {breakdownItems.map(item => (
                                    <Box key={item.key}>
                                        <HStack justify="space-between" mb={1}>
                                            <Text fontSize="sm">{item.label}</Text>
                                            <Text fontSize="sm" fontWeight="medium">{item.value}%</Text>
                                        </HStack>
                                        <Progress value={item.value} size="sm" borderRadius="sm" />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>

                        <Divider my={4} />

                        {/* Missing */}
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="semibold">Éléments manquants de l’offre</Text>
                                {!hasMissing && <Tag colorScheme="green">Tout est couvert 🎉</Tag>}
                            </HStack>

                            {hasMissing && (
                                <Stack spacing={4}>
                                    {[
                                        { key: 'skills', label: 'Compétences' },
                                        { key: 'technologies', label: 'Technologies' },
                                        { key: 'soft_skills', label: 'Soft skills' },
                                        { key: 'languages', label: 'Langues' },
                                        { key: 'education', label: 'Éducation' },
                                        { key: 'keywords', label: 'Mots-clés' }
                                    ].map(sec => {
                                        const list = missing[sec.key] || [];
                                        if (!list.length) return null;
                                        return (
                                            <Box key={sec.key}>
                                                <Text fontSize="sm" fontWeight="medium" mb={1}>
                                                    {sec.label} ({list.length})
                                                </Text>
                                                <Wrap>
                                                    {list.map((it, idx) => (
                                                        <WrapItem key={`${sec.key}-${idx}`}>
                                                            <Tag variant="subtle">{it}</Tag>
                                                        </WrapItem>
                                                    ))}
                                                </Wrap>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose}>Fermer</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

PreviewPage.propTypes = {
    structuredCV:     PropTypes.object,
    structuredOffer:  PropTypes.object,
    onEdit:           PropTypes.func.isRequired,
    onGenerate:       PropTypes.func.isRequired,
    onReset:          PropTypes.func.isRequired,
};
