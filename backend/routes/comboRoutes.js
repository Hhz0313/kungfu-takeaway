const express = require('express');
const router = express.Router();
const adminRouter = express.Router(); // Create a separate router for admin routes
const {
  getAllCombos,
  getAllCombosAdmin,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo
} = require('../controllers/comboController');
const authAdmin = require('../middleware/authAdmin');

// --- Public/Customer Routes ---
router.get('/', getAllCombos); // Get all available combos with their dishes
router.get('/:id', getComboById); // Get a specific combo with its dishes

// --- Admin Routes ---
adminRouter.use(authAdmin);

adminRouter.get('/all', getAllCombosAdmin); // Get all combos (including unavailable) for admin panel
adminRouter.post('/', createCombo); // Create a new combo (handles image upload and dish associations)
adminRouter.put('/:id', updateCombo); // Update a combo (handles image upload and dish associations)
adminRouter.delete('/:id', deleteCombo); // Delete a combo (hard delete, also removes image and associations)
// To implement "停售" (stop selling) for a combo, the updateCombo route should be used to set `is_available` to 0.

// Mount the admin router
router.use('/admin', adminRouter);

module.exports = router; 