import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/UploadForm.css';

const UploadForm = ({ onSubmit }) => {
    const [file, setFile] = useState(null); // champ pour recuperer le CV
    const [offerText, setOfferText] = useState(''); // champ pour recuperer le texte du CV

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setFile(acceptedFiles[0]);
            }
        }
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
        <form onSubmit={handleSubmit} className="upload-form">
            <h1 className="form-title">Générez un CV sur mesure avec l’IA</h1>
            <div className="form-grid">

                {/* Zone Drag & Drop */}
                <div className="dropzone-wrapper">
                    <p className="section-title">Uploadez votre CV</p>
                    <div {...getRootProps({className: 'dropzone'})}>
                        <div className="drop-icon">📤</div>
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Déposez le fichier ici...</p>
                        ) : (
                            <p>Faites glisser un fichier ici ou cliquez pour le sélectionner</p>
                        )}
                        {file && <p className="filename">📎 {file.name}</p>}
                    </div>
                </div>

                {/* Zone Texte */}
                <div className="offer-wrapper">
                    <p className="section-title">Copier-coller l'offre d'emploi qui vous interesse </p>
                    <textarea
                        rows="10"
                        placeholder="Collez ici le texte de l'offre d'emploi"
                        value={offerText}
                        onChange={(e) => setOfferText(e.target.value)}
                    ></textarea>

                    <button type="submit" className="submit-button">Générer votre nouveau CV</button>
                </div>

            </div>
        </form>
    );
};

export default UploadForm;
