const express = require('express');
const router = express.Router();
const {
    extractCv,
    extractOffer,
    reformulateResume,
    extractBoth
} = require('../controllers/gptControllerBis');

router.post('/extract-both',extractBoth);
router.post('/reformulate-resume', reformulateResume);

module.exports = router;
