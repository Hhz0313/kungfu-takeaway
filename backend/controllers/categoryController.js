const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const MODEL_NAME = 'categories';

/**
 * @desc    获取所有启用的分类 (顾客端)
 * @route   GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await readData(MODEL_NAME);
    const enabledCategories = categories.filter(cat => cat.is_enabled);
    successResponse(res, enabledCategories);
  } catch (error) {
    console.error('获取分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取分类列表失败');
  }
};

/**
 * @desc    获取所有分类 (管理端，包含禁用的)
 * @route   GET /api/categories/admin/all (Route in categoryRoutes.js is /admin/all)
 */
const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await readData(MODEL_NAME);
    // 按创建时间降序排序 (模拟数据库排序)
    const sortedCategories = categories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    successResponse(res, sortedCategories);
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
    const categories = await readData(MODEL_NAME);
    const category = categories.find(cat => cat.id === req.params.id);
    if (!category) {
      return errorResponse(res, 404, '分类未找到');
    }
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
  if (!name) {
    return errorResponse(res, 400, '分类名称为必填项');
  }
  try {
    const categories = await readData(MODEL_NAME);
    const existingCategory = categories.find(cat => cat.name === name);
    if (existingCategory) {
      return errorResponse(res, 400, '已存在同名分类');
    }
    const newCategory = {
      id: generateId(),
      name,
      description: description || null,
      is_enabled: true, // 默认启用
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.push(newCategory);
    await writeData(MODEL_NAME, categories);
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

  if (!name) {
    return errorResponse(res, 400, '分类名称为必填项');
  }

  try {
    let categories = await readData(MODEL_NAME);
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return errorResponse(res, 404, '分类未找到');
    }

    const originalCategory = categories[categoryIndex];

    // 检查新名称是否与其它分类冲突
    if (name !== originalCategory.name) {
        const existingCategory = categories.find(cat => cat.name === name && cat.id !== id);
        if (existingCategory) {
            return errorResponse(res, 400, '已存在另一个同名分类');
        }
    }

    const updatedCategory = {
      ...originalCategory,
      name,
      description: description !== undefined ? description : originalCategory.description,
      is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : originalCategory.is_enabled,
      updated_at: new Date().toISOString(),
    };
    categories[categoryIndex] = updatedCategory;
    await writeData(MODEL_NAME, categories);
    successResponse(res, updatedCategory, '分类更新成功');
  } catch (error) {
    console.error('更新分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新分类失败');
  }
};

/** 
 * @desc    删除 (禁用) 分类
 * @route   DELETE /api/categories/:id
 * @note    软删除，通过设置 is_enabled = false。如果需要硬删除，则需要检查关联菜品。
 */
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    let categories = await readData(MODEL_NAME);
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return errorResponse(res, 404, '分类未找到');
    }

    // 检查是否有菜品关联此分类 (如果需要硬删除或严格禁用)
    const dishes = await readData('dishes');
    const hasActiveDishes = dishes.some(dish => dish.category_id === id && dish.is_available);
    if (hasActiveDishes && categories[categoryIndex].is_enabled) { // 只在尝试禁用启用的分类且有关联菜品时提示
      //  return errorResponse(res, 400, '无法禁用：该分类下尚有活动的菜品。请先处理菜品。');
      //  根据需求，也可以选择仅禁用分类，让前端处理不可选的情况。
      //  此处改为允许禁用，但实际删除时可能需要更严格的检查。
    }

    // 当前实现为软删除 (切换启用状态)
    categories[categoryIndex].is_enabled = false; // 或者直接删除: categories.splice(categoryIndex, 1);
    categories[categoryIndex].updated_at = new Date().toISOString();
    
    await writeData(MODEL_NAME, categories);
    successResponse(res, null, '分类已禁用'); // 或 '分类已删除' 如果是硬删除

  } catch (error) {
    console.error('删除/禁用分类失败:', error.message);
    errorResponse(res, 500, '服务器错误: 删除/禁用分类失败');
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