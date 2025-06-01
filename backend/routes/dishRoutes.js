const express = require('express');
const router = express.Router();
const {
  getAllDishes,
  getAllDishesAdmin,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  // upload middleware is implicitly used by createDish and updateDish in the controller
} = require('../controllers/dishController');

// Guest/Customer routes
router.get('/', getAllDishes); // Get all available dishes, can filter by categoryId query param
router.get('/:id', getDishById); // Get a specific dish

// Admin routes
router.get('/admin/all', getAllDishesAdmin); // Get all dishes including unavailable ones for admin
router.post('/', createDish);       // Create a new dish (handles image upload via multer in controller)
router.put('/:id', updateDish);     // Update a dish (handles image upload via multer in controller)
router.delete('/:id', deleteDish);   // Delete a dish (hard delete, also removes image)
// To implement "停售" (stop selling), the updateDish route should be used to set `is_available` to 0.

module.exports = router; 