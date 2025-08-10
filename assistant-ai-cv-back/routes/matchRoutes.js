// routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { computeMatchScore } = require('../controllers/matchController');

router.post('/score', computeMatchScore);

module.exports = router;
