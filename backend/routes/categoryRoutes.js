const express = require('express');
const router = express.Router();
const adminRouter = express.Router(); // Create a separate router for admin routes
const {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const authAdmin = require('../middleware/authAdmin');

// --- Public/Customer Routes ---
router.get('/', getAllCategories); // Get all enabled categories
router.get('/:id', getCategoryById); // Get a specific category

// --- Admin Routes ---
// Apply auth middleware to all admin routes
adminRouter.use(authAdmin);

adminRouter.get('/all', getAllCategoriesAdmin); // Get all categories including disabled ones for admin
adminRouter.post('/', createCategory); // Create a new category
adminRouter.put('/:id', updateCategory); // Update a category (name, description, is_enabled)
adminRouter.delete('/:id', deleteCategory); // Disable a category (soft delete)

// Mount the admin router under the main router with an /admin prefix
router.use('/admin', adminRouter);

module.exports = router; 