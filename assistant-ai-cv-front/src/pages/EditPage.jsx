// EditPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    VStack,
    HStack,
    Input,
    Textarea,
    Text,
    IconButton,
    Button,
    Heading,
    Divider,
    Flex,
    FormControl,
    useColorModeValue,
    FormLabel
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FaTimes } from 'react-icons/fa';
import Nav from '../components/Nav';

const EditPage = ({ structuredCV, onChange, onBack, onGenerate, language }) => {
    const [expanded, setExpanded] = useState([]);
    const bgPage     = useColorModeValue('white', 'background'); // clair → gris très pâle, sombre → token background
    const bgCard     = useColorModeValue('gray.50',    'card');       // clair → blanc,       sombre → token card

    useEffect(() => {
        setExpanded(Object.keys(structuredCV));
    }, [structuredCV]);

    const updateField = (section, path, value) => {
        const updated = structuredClone(structuredCV);
        if (path) {
            const keys = path.split('.');
            let target = updated[section];
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (typeof target[key] !== 'object' || target[key] === null) {
                    target[key] = isNaN(keys[i + 1]) ? {} : [];
                }
                target = target[key];
            }
            target[keys[keys.length - 1]] = value;
        } else {
            updated[section] = value;
        }
        onChange(updated);
    };

    const addItem = (section, path) => {
        const updated = structuredClone(structuredCV);
        let target = updated[section];
        if (path) {
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!target[key]) target[key] = isNaN(keys[i + 1]) ? {} : [];
                target = target[key];
            }
            const lastKey = keys[keys.length - 1];
            if (!Array.isArray(target[lastKey])) target[lastKey] = [];
            target[lastKey].push('');
        } else {
            if (Array.isArray(target)) target.push({});
        }
        onChange(updated);
    };

    const removeItem = (section, path, index) => {
        const updated = structuredClone(structuredCV);
        let target = updated[section];
        if (path) {
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!target) return;
                target = target[keys[i]];
            }
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(target[lastKey])) target[lastKey].splice(index, 1);
        } else {
            if (Array.isArray(target)) target.splice(index, 1);
        }
        onChange(updated);
    };

    const labelFor = key => ({
        full_name: 'Nom complet',
        cv_title: 'Titre du CV',
        profile: 'Profil',
        skills: 'Compétences techniques',
        soft_skills: 'Atouts',
        hobbies: 'Centres d’intérêt',
        languages: 'Langues',
        experiences: 'Expériences',
        projects: 'Projets',
        educations: 'Formations',
        certifications: 'Certifications',
        contact: 'Contact',
        keywords_in_common: 'Mots-clés en commun'
    }[key] || key);

    return (

        <Box pos="absolute" inset="0" bg={bgPage} color="text" >
            <Nav />
            <Heading
                as="h2"
                fontSize="2xl"
                mb={6}
                textAlign="center"
                py={4}
                mt={6}
            >
                ✏️ Modifier le CV à votre guise
            </Heading>
            <Box maxW="4xl" mx="auto" mt={6} mb={6} p={4} bg={bgCard} rounded="lg" boxShadow="md" w="100%" minH="100">

                <Accordion allowMultiple defaultIndex={[0]}>
                    {Object.entries(structuredCV).map(([section, value]) => {
                        if (section === 'language') return null;
                        return (
                            <AccordionItem key={section} border="1px solid" borderColor="step" rounded="md" mb={4}>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="medium">
                                        {labelFor(section)}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel>
                                    <VStack spacing={4} align="stretch">
                                        {/* champs simples */}
                                        {typeof value === 'string' && (
                                            <FormControl>
                                                <FormLabel fontSize="sm">{labelFor(section)}</FormLabel>
                                                {section === 'profile' ? (
                                                    <Textarea size="sm" value={value} onChange={e => updateField(section, '', e.target.value)} />
                                                ) : (
                                                    <Input size="sm" value={value} onChange={e => updateField(section, '', e.target.value)} />
                                                )}
                                            </FormControl>
                                        )}

                                        {/* Contact */}
                                        {section === 'contact' && Object.entries(value).map(([k, v]) => (
                                            <FormControl key={k}>
                                                <FormLabel fontSize="sm">{k.charAt(0).toUpperCase()+k.slice(1)}</FormLabel>
                                                <Input size="sm" placeholder={k} value={v||''} onChange={e => updateField(section, k, e.target.value)} />
                                            </FormControl>
                                        ))}

                                        {/* Expériences & Projets */}
                                        {['experiences','projects'].includes(section) && Array.isArray(value) && (
                                            <>
                                                {value.map((obj,i)=>(
                                                    <Box key={i} p={4} bg="background" rounded="md" border="1px solid" borderColor="step">
                                                        <VStack spacing={3} align="stretch">
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Titre</FormLabel>
                                                                <Input size="sm" value={obj.title||''} onChange={e=>updateField(section,`${i}.title`,e.target.value)} />
                                                            </FormControl>
                                                            {section==='experiences'&&(
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Entreprise</FormLabel>
                                                                    <Input size="sm" value={obj.company||''} onChange={e=>updateField(section,`${i}.company`,e.target.value)} />
                                                                </FormControl>
                                                            )}
                                                            <HStack>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Début</FormLabel>
                                                                    <Input size="sm" value={obj.start_date||''} onChange={e=>updateField(section,`${i}.start_date`,e.target.value)} />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Fin</FormLabel>
                                                                    <Input size="sm" value={obj.end_date||''} onChange={e=>updateField(section,`${i}.end_date`,e.target.value)} />
                                                                </FormControl>
                                                            </HStack>
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Objectif</FormLabel>
                                                                <Textarea size="sm" value={obj.description?.goal||''} onChange={e=>updateField(section,`${i}.description.goal`,e.target.value)} />
                                                            </FormControl>
                                                            <Box>
                                                                <Text fontSize="sm" mb={1}>Tâches :</Text>
                                                                <VStack spacing={1} align="stretch">
                                                                    {obj.description?.tasks?.map((task,j)=>(
                                                                        <HStack key={j}>
                                                                            <Input size="sm" value={task} onChange={e=>updateField(section,`${i}.description.tasks.${j}`,e.target.value)} />
                                                                            <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,`${i}.description.tasks`,j)} />
                                                                        </HStack>
                                                                    ))}
                                                                    <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,`${i}.description.tasks`)} variant="outline">Ajouter tâche</Button>
                                                                </VStack>
                                                            </Box>
                                                        </VStack>
                                                    </Box>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter {labelFor(section).toLowerCase()}
                                                </Button>
                                            </>
                                        )}

                                        {/* Compétences techniques */}
                                        {section==='skills'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <HStack key={i}>
                                                        <Input size="sm" placeholder="Compétence" value={item.name||''} onChange={e=>updateField(section,`${i}.name`,e.target.value)} />
                                                        <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} />
                                                    </HStack>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter compétence
                                                </Button>
                                            </VStack>
                                        )}

                                        {/* Soft skills */}
                                        {section==='soft_skills'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <HStack key={i}>
                                                        <Input size="sm" placeholder="Atout" value={item.name||''} onChange={e=>updateField(section,`${i}.name`,e.target.value)} />
                                                        <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} />
                                                    </HStack>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter atout
                                                </Button>
                                            </VStack>
                                        )}

                                        {/* Langues */}
                                        {section==='languages'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <HStack key={i} spacing={2}>
                                                        <Input size="sm" placeholder="Langue" value={item.language||''} onChange={e=>updateField(section,`${i}.language`,e.target.value)} />
                                                        <Input size="sm" placeholder="Niveau" value={item.level||''} onChange={e=>updateField(section,`${i}.level`,e.target.value)} />
                                                        <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} />
                                                    </HStack>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter langue
                                                </Button>
                                            </VStack>
                                        )}

                                        {/* Formations */}
                                        {section==='educations'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <Box key={i} p={3} border="1px solid" borderColor="step" rounded="md">
                                                        <VStack spacing={2} align="stretch">
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Établissement</FormLabel>
                                                                <Input size="sm" value={item.institution||''} onChange={e=>updateField(section,`${i}.institution`,e.target.value)} />
                                                            </FormControl>
                                                            <HStack>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Début</FormLabel>
                                                                    <Input size="sm" value={item.start_date||''} onChange={e=>updateField(section,`${i}.start_date`,e.target.value)} />
                                                                </FormControl>
                                                                <FormControl>
                                                                    <FormLabel fontSize="sm">Fin</FormLabel>
                                                                    <Input size="sm" value={item.end_date||''} onChange={e=>updateField(section,`${i}.end_date`,e.target.value)} />
                                                                </FormControl>
                                                            </HStack>
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Description</FormLabel>
                                                                <Textarea size="sm" value={item.description||''} onChange={e=>updateField(section,`${i}.description`,e.target.value)} />
                                                            </FormControl>
                                                            <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} alignSelf="flex-end" />
                                                        </VStack>
                                                    </Box>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter formation
                                                </Button>
                                            </VStack>
                                        )}
                                        {/* Centres d’intérêt */}
                                        {section==='hobbies'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <HStack key={i}>
                                                        <Input size="sm" placeholder="Centre d’intérêt" value={item||''} onChange={e=>updateField(section,`${i}`,e.target.value)} />
                                                        <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} />
                                                    </HStack>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter centre d’intérêt
                                                </Button>
                                            </VStack>
                                        )}
                                        {/* Certifications */}
                                        {section==='certifications'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((item,i)=>(
                                                    <Box key={i} p={3} border="1px solid" borderColor="step" rounded="md">
                                                        <VStack spacing={2} align="stretch">
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Nom</FormLabel>
                                                                <Input size="sm" value={item.name||''} onChange={e=>updateField(section,`${i}.name`,e.target.value)} />
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Organisme</FormLabel>
                                                                <Input size="sm" value={item.issuer||''} onChange={e=>updateField(section,`${i}.issuer`,e.target.value)} />
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel fontSize="sm">Date</FormLabel>
                                                                <Input size="sm" value={item.date||''} onChange={e=>updateField(section,`${i}.date`,e.target.value)} />
                                                            </FormControl>
                                                            <IconButton icon={<FaTimes size={12}/>} size="xs" variant="ghost" onClick={()=>removeItem(section,null,i)} alignSelf="flex-end" />
                                                        </VStack>
                                                    </Box>
                                                ))}
                                                <Button leftIcon={<AddIcon />} size="xs" onClick={()=>addItem(section,null)} variant="outline">
                                                    Ajouter certification
                                                </Button>
                                            </VStack>
                                        )}

                                        {/* Mots-clés en commun */}
                                        {section==='keywords_in_common'&&Array.isArray(value)&&(
                                            <VStack spacing={2} align="stretch">
                                                {value.map((kw,i)=>(
                                                    <HStack key={i}>
                                                        <Input size="sm" placeholder="Mot-clé" value={kw||''} onChange={e=>updateField(section,`${i}`,e.target.value)} />
                                                    </HStack>
                                                ))}
                                            </VStack>
                                        )}

                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        );
                    })}
                </Accordion>

                <Divider my={8} />

                <Flex justify="space-between">
                    <Button onClick={onBack} variant="outline" colorScheme="gray">
                        Aperçu
                    </Button>
                    <Button onClick={onGenerate} colorScheme="blue">
                        Générer le CV en PDF
                    </Button>
                </Flex>
            </Box>
        </Box>

    );
};

export default EditPage;
