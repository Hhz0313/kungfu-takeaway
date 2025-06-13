const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Using synchronous fs for existsSync/unlinkSync for simplicity in multer callbacks
const fsp = require('fs').promises; // For deleting files asynchronously in controller actions
const knex = require('../utils/knex');
const { FIXED_CANTEENS } = require('./configController'); // 引入写死的五个食堂

const DISH_MODEL_NAME = 'dishes';
const CATEGORY_MODEL_NAME = 'categories';
const COMBO_DISHES_MODEL_NAME = 'comboDishes';
const CANTEEN_MODEL_NAME = 'canteens';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/dishes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, db.generateId() + path.extname(file.originalname)); // 使用自定义ID + 后缀名
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('image'); // 'image' is the field name in the form-data

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('错误: 只允许上传图片 (jpeg, jpg, png, gif)!');
}

// 辅助函数：删除文件（如果存在）
async function deleteFileIfExists(filePath) {
    if (!filePath) return;
    // Adjusted to expect a relative path like 'uploads/dishes/filename.jpg'
    // or an absolute path. If it doesn't start with a slash or drive letter, assume relative to project root.
    let absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);

    // Special handling if it's already a relative path from __dirname like `../uploads/dishes...`
    if (filePath.startsWith('../uploads')) {
        absolutePath = path.join(__dirname, filePath.substring(filePath.indexOf('../') + 2));
    } else if (filePath.startsWith('uploads/')) {
         absolutePath = path.join(__dirname, '..', filePath);
    }


    try {
        await fsp.access(absolutePath);
        await fsp.unlink(absolutePath);
        // console.log(`Successfully deleted file: ${absolutePath}`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.warn(`无法删除文件 ${absolutePath}: ${error.message}`);
        }
    }
}

/**
 * @desc    获取所有可用菜品 (可选按分类/食堂过滤)
 * @route   GET /api/dishes
 */
const getAllDishes = async (req, res) => {
  const { categoryId, canteenId } = req.query;
  try {
    const filter = {};
    if (categoryId) filter.category_id = categoryId;
    if (canteenId) filter.canteen_id = canteenId;
    filter.is_available = true;
    let dishes = await db.getAllDishes(filter);
    // 可选：联表查 category/canteen 名称，或前端自行处理
    dishes = dishes.map(dish => ({
      ...dish,
      flavors: typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors,
    }));
    dishes.sort((a, b) => a.name.localeCompare(b.name));
    successResponse(res, dishes, 'Dishes retrieved successfully');
  } catch (error) {
    console.error('获取菜品列表失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取菜品列表失败');
  }
};

/**
 * @desc    获取所有菜品 (管理端，包含不可用的)
 * @route   GET /api/dishes/admin/all
 */
const getAllDishesAdmin = async (req, res) => {
    try {
        let dishes = await db.getAllDishes({});
        const categories = await db.getAllCategories();
        // const canteens = await db.getAllCanteens();
        const canteens = FIXED_CANTEENS; // 用写死的五个食堂

        dishes = dishes.map(dish => {
            const category = categories.find(c => c.id === dish.category_id);
            const canteen = canteens.find(can => can.id === dish.canteen_id);
            return {
                ...dish,
                category_name: category ? category.name : '未知分类',
                canteen_name: canteen ? canteen.name : (dish.canteen_id ? '未知食堂' : null),
                flavors: typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors,
            };
        });
        dishes.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        successResponse(res, dishes, 'All dishes retrieved successfully for admin');
    } catch (error) {
        console.error('获取所有菜品失败 (管理端):', error.message, error.stack);
        errorResponse(res, 500, '服务器错误: 获取所有菜品失败 (管理端)');
    }
};

/**
 * @desc    根据ID获取单个菜品详情
 * @route   GET /api/dishes/:id
 */
const getDishById = async (req, res) => {
  try {
    const dish = await db.getDishById(req.params.id);
    if (!dish) return errorResponse(res, 404, '菜品未找到');
    
    console.log('原始数据:', {
      id: dish.id,
      name: dish.name,
      flavors: dish.flavors,
      flavorsType: typeof dish.flavors
    });
    
    // 处理 flavors
    try {
      // 从数据库获取的 flavors 应该是 JSON 字符串
      if (typeof dish.flavors === 'string') {
        try {
          // 尝试解析 JSON 字符串
          const parsedFlavors = JSON.parse(dish.flavors);
          // 确保解析结果是数组
          if (Array.isArray(parsedFlavors)) {
            dish.flavors = parsedFlavors;
          } else {
            console.warn('解析的 flavors 不是数组:', parsedFlavors);
            dish.flavors = [];
          }
        } catch (e) {
          console.error('JSON 解析失败:', e);
          dish.flavors = [];
        }
      } else if (!Array.isArray(dish.flavors)) {
        console.warn('flavors 不是字符串也不是数组:', dish.flavors);
        dish.flavors = [];
      }
      
      // 确保所有元素都是字符串
      dish.flavors = dish.flavors.map(f => String(f).trim()).filter(f => f);
      
      console.log('最终处理结果:', {
        id: dish.id,
        name: dish.name,
        flavors: dish.flavors,
        flavorsLength: dish.flavors.length
      });
      
    } catch (e) {
      console.error('处理 flavors 时出错:', e);
      dish.flavors = [];
    }
    
    successResponse(res, dish, 'Dish retrieved successfully');
  } catch (error) {
    console.error('获取单个菜品失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取单个菜品失败');
  }
};

/**
 * @desc    创建新菜品
 * @route   POST /api/dishes
 */
const createDish = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || err);
    const { category_id, name, description, price, flavors, is_available = true, canteen_id } = req.body;
    const image_url = req.file ? `/uploads/dishes/${req.file.filename}` : null;
    if (!category_id || !name || price === undefined) {
      if (image_url) await deleteFileIfExists(image_url);
      return errorResponse(res, 400, '分类ID、菜品名称和价格为必填项');
    }
    try {
      let parsedFlavors = [];
      if (typeof flavors === 'string') {
        try { parsedFlavors = JSON.parse(flavors); } catch { parsedFlavors = flavors.split(',').map(f => f.trim()).filter(f => f); }
      } else if (Array.isArray(flavors)) {
        parsedFlavors = flavors.map(f => f.toString().trim()).filter(f => f);
      }
      const newDish = {
        id: db.generateId(),
        category_id,
        canteen_id: canteen_id || null,
        name,
        description: description || null,
        price: parseFloat(price),
        image_url,
        flavors: JSON.stringify(parsedFlavors),
        is_available: Boolean(is_available),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.createDish(newDish);
      successResponse(res, newDish, '菜品创建成功', 201);
    } catch (error) {
      console.error('创建菜品失败:', error.message, error.stack);
      if (image_url) await deleteFileIfExists(image_url);
      errorResponse(res, 500, '服务器错误: 创建菜品失败');
    }
  });
};

/**
 * @desc    更新菜品信息
 * @route   PUT /api/dishes/:id
 */
const updateDish = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || err);
    const { category_id, name, description, price, flavors, is_available, canteen_id } = req.body;
    try {
      const dish = await db.getDishById(id);
      if (!dish) {
        if (req.file) await deleteFileIfExists(`/uploads/dishes/${req.file.filename}`);
        return errorResponse(res, 404, '菜品未找到');
      }
      let updates = {};
      if (category_id) updates.category_id = category_id;
      if (canteen_id !== undefined) updates.canteen_id = canteen_id || null;
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description || null;
      if (price !== undefined) updates.price = parseFloat(price);
      if (is_available !== undefined) updates.is_available = Boolean(is_available);
      if (flavors !== undefined) {
        let parsedFlavors;
        if (typeof flavors === 'string') {
          try { parsedFlavors = JSON.parse(flavors); } catch { parsedFlavors = flavors.split(',').map(f => f.trim()).filter(f => f); }
        } else if (Array.isArray(flavors)) {
          parsedFlavors = flavors.map(f => f.toString().trim()).filter(f => f);
        }
        updates.flavors = JSON.stringify(parsedFlavors);
      }
      if (req.file) {
        updates.image_url = `/uploads/dishes/${req.file.filename}`;
        if (dish.image_url && dish.image_url !== updates.image_url) await deleteFileIfExists(dish.image_url);
      }
      await db.updateDish(id, updates);
      const updatedDish = await db.getDishById(id);
      updatedDish.flavors = typeof updatedDish.flavors === 'string' ? JSON.parse(updatedDish.flavors) : updatedDish.flavors;
      successResponse(res, updatedDish, '菜品更新成功');
    } catch (error) {
      console.error('更新菜品失败:', error.message, error.stack);
      if (req.file) await deleteFileIfExists(`/uploads/dishes/${req.file.filename}`);
      errorResponse(res, 500, '服务器错误: 更新菜品失败');
    }
  });
};

/**
 * @desc    删除菜品
 * @route   DELETE /api/dishes/:id
 */
const deleteDish = async (req, res) => {
  const { id } = req.params;
  try {
    // 直接查 combo_dishes 表，确保查到所有关联
    const related = await knex('combo_dishes').where({ dish_id: id });
    console.log('[删除菜品] combo_dishes 直接查表结果:', related);
    if (related.length > 0) {
      return errorResponse(res, 400, '无法删除菜品，因为它已关联到套餐中。请先从套餐中移除该菜品。');
    }
    const dish = await db.getDishById(id);
    if (!dish) return errorResponse(res, 404, '菜品未找到');
    if (dish.image_url) await deleteFileIfExists(dish.image_url);
    await db.deleteDish(id);
    successResponse(res, null, '菜品删除成功');
  } catch (error) {
    console.error('删除菜品失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 删除菜品失败');
  }
};

module.exports = {
  getAllDishes,
  getAllDishesAdmin,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  upload
};