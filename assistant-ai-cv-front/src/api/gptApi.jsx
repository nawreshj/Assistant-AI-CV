import axios from "axios";
import { GPT_EXTRACTION, GPT_REFORMULATION} from "../constants/back.jsx";


export const getExtractionGpt= async ({cvText,offerText}) => {
    try {
        const response = await axios.post(GPT_EXTRACTION, {cvText,offerText});
        return response.data;
    } catch (error) {
        console.error("error lors de la récuperation des infos avec openAI"+ error);
    }
};

export const getReformulationGpt= async ({cvData,offerData}) => {
    try {
        const response = await axios.post(GPT_REFORMULATION, {cvData,offerData});
        return response.data;
    } catch (error) {
        console.error("error lors de la reformulation  avec openAI"+ error);
    }
};

