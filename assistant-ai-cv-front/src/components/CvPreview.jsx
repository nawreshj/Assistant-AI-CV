import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchCvHtml } from '../api/pdfApi';

export default function CvPreview({ structuredCV }) {
    const [html, setHtml] = useState('');
    useEffect(() => {
        fetchCvHtml(structuredCV).then(setHtml).catch(console.error);
    }, [structuredCV]);
    return (
        <iframe
            title="Aperçu CV"
            srcDoc={html}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
    );
}

CvPreview.propTypes = {
    structuredCV: PropTypes.object.isRequired
};
