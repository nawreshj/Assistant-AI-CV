
const express = require('express');
const multer = require('multer');
const { extractBothText } = require('../controllers/extractionController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/extract-both-text', upload.single('file'), extractBothText);

module.exports = router;
