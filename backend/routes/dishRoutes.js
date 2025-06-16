const express = require('express');
const router = express.Router();
const adminRouter = express.Router(); // Create a separate router for admin routes
const {
  getAllDishes,
  getAllDishesAdmin,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  // upload middleware is implicitly used by createDish and updateDish in the controller
} = require('../controllers/dishController');
const authAdmin = require('../middleware/authAdmin');

// Guest/Customer routes
router.get('/', getAllDishes); // Get all available dishes, can filter by categoryId query param
router.get('/:id', getDishById); // Get a specific dish

// Admin routes
adminRouter.get('/all', getAllDishesAdmin);
adminRouter.post('/', createDish);       // Create a new dish (handles image upload via multer in controller)
adminRouter.put('/:id', updateDish);     // Update a dish (handles image upload via multer in controller)
adminRouter.delete('/:id', deleteDish);   // Delete a dish (hard delete, also removes image)
// To implement "停售" (stop selling), the updateDish route should be used to set `is_available` to 0.

// Mount the admin router
router.use('/admin', adminRouter);

module.exports = router; 