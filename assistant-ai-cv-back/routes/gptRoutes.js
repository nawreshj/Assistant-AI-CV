const express = require('express');
const router = express.Router();
const {
    extractCv,
    extractOffer,
    reformulateResume,
    extractBoth
} = require('../controllers/gptController');

router.post('/extract-both',extractBoth);
router.post('/reformulate-resume', reformulateResume);

module.exports = router;
