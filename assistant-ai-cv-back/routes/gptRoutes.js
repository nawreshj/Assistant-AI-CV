const express = require('express');
const router = express.Router();
const {
    extractCv,
    extractOffer,
    reformulateResume,
    extractBoth
} = require('../controllers/gptController');

router.post('/extract-cv', extractCv);
router.post('/extract-offer', extractOffer);
router.post('/extract-both',extractBoth);
router.post('/reformulate-resume', reformulateResume);

module.exports = router;
