const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

// @route   GET /api/config/canteens
// @desc    Get the list of available canteens
// @access  Public (or Admin if preferred for internal config)
router.get('/canteens', configController.getAvailableCanteens);

module.exports = router; 