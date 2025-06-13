const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

/**
 * @desc    获取所有启用的分类 (顾客端)
 * @route   GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await db.getAllCategories({ is_enabled: true });
    successResponse(res, categories);
  } catch (error) {
    console.error('获取分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取分类列表失败');
  }
};

/**
 * @desc    获取所有分类 (管理端，包含禁用的)
 * @route   GET /api/categories/admin/all
 */
const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await db.getAllCategories();
    categories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    successResponse(res, categories);
  } catch (error) {
    console.error('获取所有分类失败 (管理端):', error.message);
    errorResponse(res, 500, '服务器错误: 获取所有分类列表失败 (管理端)');
  }
};

/**
 * @desc    根据ID获取单个分类
 * @route   GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const category = await db.getCategoryById(req.params.id);
    if (!category) return errorResponse(res, 404, '分类未找到');
    successResponse(res, category);
  } catch (error) {
    console.error('获取单个分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取单个分类失败');
  }
};

/**
 * @desc    创建新分类
 * @route   POST /api/categories
 */
const createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return errorResponse(res, 400, '分类名称为必填项');
  try {
    const existing = await db.getAllCategories();
    if (existing.find(cat => cat.name === name)) {
      return errorResponse(res, 400, '已存在同名分类');
    }
    const newCategory = {
      id: db.generateId(),
      name,
      description: description || null,
      is_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.createCategory(newCategory);
    successResponse(res, newCategory, '分类创建成功');
  } catch (error) {
    console.error('创建分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 创建分类失败');
  }
};

/**
 * @desc    更新分类信息
 * @route   PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_enabled } = req.body;
  if (!name) return errorResponse(res, 400, '分类名称为必填项');
  try {
    const category = await db.getCategoryById(id);
    if (!category) return errorResponse(res, 404, '分类未找到');
    // 检查新名称是否与其它分类冲突
    const all = await db.getAllCategories();
    if (all.find(cat => cat.name === name && cat.id !== id)) {
      return errorResponse(res, 400, '已存在另一个同名分类');
    }
    const updates = {
      name,
      description: description !== undefined ? description : category.description,
      is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : category.is_enabled,
    };
    await db.updateCategory(id, updates);
    const updated = await db.getCategoryById(id);
    successResponse(res, updated, '分类更新成功');
  } catch (error) {
    console.error('更新分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新分类失败');
  }
};

/**
 * @desc    删除 (禁用) 分类
 * @route   DELETE /api/categories/:id
 * @note    软删除，通过设置 is_enabled = false。
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await db.getCategoryById(id);
    if (!category) return errorResponse(res, 404, '分类未找到');
    // 检查是否有关联菜品
    const dishes = await db.getAllDishes({ category_id: id, is_available: true });
    if (dishes.length > 0 && category.is_enabled) {
      return errorResponse(res, 400, '该分类下存在可用菜品，无法禁用');
    }
    await db.updateCategory(id, { is_enabled: false });
    successResponse(res, null, '分类已禁用');
  } catch (error) {
    console.error('禁用分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 禁用分类失败');
  }
};

module.exports = {
  getAllCategories,
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};