import React, { useRef, useEffect } from 'react';

const AutoResizeTextarea = ({ value, onChange, placeholder, className = "" }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // reset
            textarea.style.height = textarea.scrollHeight + "px"; // ajustement
        }
    }, [value]); // s'exécute à chaque changement de valeur

    return (
        <textarea
            ref={textareaRef}
            className={`auto-textarea ${className}`}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            rows={1} // pour éviter le saut à 3 lignes par défaut
        />
    );
};

export default AutoResizeTextarea;