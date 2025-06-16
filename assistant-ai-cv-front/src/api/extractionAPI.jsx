import axios from "axios";
import {EXTRACTION_BOTH_TEXT} from "../constants/back.jsx";


export const getExtractionText = async (formData) => {
    try {
       const response = await axios.post(EXTRACTION_BOTH_TEXT, formData);
        return response.data;
    } catch (error) {
        console.error("error lors de la récuperation des textes"+ error);
    }
};