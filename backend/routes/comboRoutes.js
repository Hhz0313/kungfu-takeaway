const express = require('express');
const router = express.Router();
const {
  getAllCombos,
  getAllCombosAdmin,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
} = require('../controllers/comboController');

// Guest/Customer routes
router.get('/', getAllCombos); // Get all available combos with their dishes
router.get('/:id', getComboById); // Get a specific combo with its dishes

// Admin routes
router.get('/admin/all', getAllCombosAdmin); // Get all combos (including unavailable) for admin panel
router.post('/', createCombo); // Create a new combo (handles image upload and dish associations)
router.put('/:id', updateCombo); // Update a combo (handles image upload and dish associations)
router.delete('/:id', deleteCombo); // Delete a combo (hard delete, also removes image and associations)
// To implement "停售" (stop selling) for a combo, the updateCombo route should be used to set `is_available` to 0.

module.exports = router; 