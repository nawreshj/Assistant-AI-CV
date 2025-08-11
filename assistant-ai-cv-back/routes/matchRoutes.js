// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { computeMatchScore, computeMatchScoreWithOffer } = require('../controllers/matchController');

router.post('/score', computeMatchScore);
router.post('/score-with-offer', computeMatchScoreWithOffer);


module.exports = router;
