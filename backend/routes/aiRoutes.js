const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authUser = require('../middleware/authUser');

// POST /api/ai/recommend - Get AI-powered meal recommendation
router.post('/recommend', authUser, aiController.getRecommendation);

module.exports = router; 