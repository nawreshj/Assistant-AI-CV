const express = require('express');
const router  = express.Router();
const { generatePdf } = require('../controllers/pdfController');
const { getCvHtml }   = require('../controllers/htmlController');


router.post('/generate', generatePdf);
router.post('/html',     getCvHtml);


module.exports = router;
