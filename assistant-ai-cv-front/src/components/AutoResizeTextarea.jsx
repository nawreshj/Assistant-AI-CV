import React, { useRef, useEffect } from 'react';

const AutoResizeTextarea = ({ value, onChange, placeholder, className = "" }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // reset
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className={`auto-textarea ${className}`}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            rows={1}
        />
    );
};

export default AutoResizeTextarea;