import React from 'react';
import '../styles/Loading.css';

const Loading = () => {
    return (
        <div className="loading-container">
            <h2>Analyse en cours...</h2>
            <p>Veuillez patienter pendant que nous traitons votre CV et l'offre.</p>
        </div>
    );
};

export default Loading;
