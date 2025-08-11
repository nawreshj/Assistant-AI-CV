// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const {computeMatchScoreWithOffer } = require('../controllers/matchController');


router.post('/score-with-offer', computeMatchScoreWithOffer);


module.exports = router;
