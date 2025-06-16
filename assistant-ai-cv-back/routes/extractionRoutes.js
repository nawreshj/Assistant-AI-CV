
const express = require('express');
const multer = require('multer');
const { extractBothText } = require('../controllers/extractionController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
// → Multer stocke le fichier uploadé dans uploads/ puis ajoute `req.file.path`

// POST /extract-both
// - champ “file” contient le CV (PDF ou image)
// - champ “offerText” (form-data) contient le texte de l’offre
router.post('/extract-both-text', upload.single('file'), extractBothText);

module.exports = router;
