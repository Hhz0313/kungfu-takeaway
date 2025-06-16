const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// --- Public Routes ---
// Admin login
router.post('/login', adminController.loginAdmin);

module.exports = router; 