const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Guest/Customer routes
router.get('/', getAllCategories); // Get all enabled categories
router.get('/:id', getCategoryById); // Get a specific category

// Admin routes
router.get('/admin/all', getAllCategoriesAdmin); // Get all categories including disabled ones for admin
router.post('/', createCategory); // Create a new category
router.put('/:id', updateCategory); // Update a category (name, description, is_enabled)
router.delete('/:id', deleteCategory); // Disable a category (soft delete)

module.exports = router; 