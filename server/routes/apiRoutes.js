const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');

router.post('/analyze', riskController.analyzeRisk);
router.post('/save', riskController.saveReport);
router.get('/history/:username', riskController.getHistory);

module.exports = router;
