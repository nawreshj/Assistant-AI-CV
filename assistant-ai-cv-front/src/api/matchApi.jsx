// src/api/matchApi.js
import axios from "axios";
import { MATCH_SCORE_WITH_OFFER } from "../constants/back.jsx";


export const getMatchScoreWithOffer = async ({ cv, offer }) => {
    try {
        const response = await axios.post(MATCH_SCORE_WITH_OFFER, { cv, offer });
        return response.data; // { score, breakdown, missing }
    } catch (error) {
        console.error("Erreur lors du calcul du score avec offre:", error);
        // remonte une erreur propre pour le composant (toast, etc.)
        throw error?.response?.data || error;
    }
};


