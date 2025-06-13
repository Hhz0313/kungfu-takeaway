const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;

const COMBO_MODEL_NAME = 'combos';
const DISH_MODEL_NAME = 'dishes';
const COMBO_DISHES_MODEL_NAME = 'comboDishes';

// 确保套餐图片上传目录存在
const uploadsDir = path.join(__dirname, '../uploads/combos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, db.generateId() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('错误: 只允许上传图片 (jpeg, jpg, png, gif)!');
  }
}).single('image');

async function deleteFileIfExists(filePath) {
  if (!filePath) return;
  let absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);
  if (filePath.startsWith('../uploads')) {
    absolutePath = path.join(__dirname, filePath.substring(filePath.indexOf('../') + 2));
  } else if (filePath.startsWith('uploads/')) {
    absolutePath = path.join(__dirname, '..', filePath);
  }
  try {
    await fsp.access(absolutePath);
    await fsp.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`无法删除文件 ${absolutePath}: ${error.message}`);
    }
  }
}

/**
 * @desc    获取所有可用套餐 (顾客端)
 * @route   GET /api/combos
 */
const getAllCombos = async (req, res) => {
  try {
    let combos = await db.getAllCombos({ is_enabled: true });
    const comboIds = combos.map(c => c.id);
    const comboDishesLinks = await db.getComboDishes();
    const dishes = await db.getAllDishes({ is_available: true });
    for (let combo of combos) {
      const relatedLinks = comboDishesLinks.filter(link => link.combo_id === combo.id);
      combo.dishes = relatedLinks.map(link => {
        const dishInfo = dishes.find(d => d.id === link.dish_id);
        return dishInfo ? {
          dish_id: dishInfo.id,
          name: dishInfo.name,
          quantity: link.quantity,
          price: dishInfo.price,
          image_url: dishInfo.image_url,
          is_available: dishInfo.is_available
        } : null;
      }).filter(d => d);
      if (combo.dishes.length !== relatedLinks.length) {
        combo.contains_unavailable_items = true;
      }
    }
    const finalCombos = combos.filter(c => !c.contains_unavailable_items);
    successResponse(res, finalCombos.sort((a, b) => a.name.localeCompare(b.name)), 'Combos retrieved successfully');
  } catch (error) {
    console.error('获取套餐列表失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取套餐列表失败');
  }
};

/**
 * @desc    获取所有套餐 (管理端)
 * @route   GET /api/combos/admin/all
 */
const getAllCombosAdmin = async (req, res) => {
  try {
    let combos = await db.getAllCombos();
    const comboDishesLinks = await db.getComboDishes();
    const dishes = await db.getAllDishes();
    for (let combo of combos) {
      const relatedLinks = comboDishesLinks.filter(link => link.combo_id === combo.id);
      combo.dishes = relatedLinks.map(link => {
        const dishInfo = dishes.find(d => d.id === link.dish_id);
        return dishInfo ? {
          dish_id: dishInfo.id,
          name: dishInfo.name,
          quantity: link.quantity
        } : { dish_id: link.dish_id, name: '[菜品已删除或ID错误]', quantity: link.quantity };
      });
      // 修复：补充 is_enabled 字段，兼容前端依赖
      combo.is_enabled = !!combo.is_enabled;
    }
    successResponse(res, combos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), 'All combos retrieved successfully for admin');
  } catch (error) {
    console.error('获取所有套餐失败 (管理端):', error.message);
    errorResponse(res, 500, '服务器错误: 获取所有套餐失败 (管理端)');
  }
};

/**
 * @desc    根据ID获取单个套餐详情
 * @route   GET /api/combos/:id
 */
const getComboById = async (req, res) => {
  try {
    const combo = await db.getComboById(req.params.id);
    if (!combo) return errorResponse(res, 404, '套餐未找到');
    const comboDishesLinks = await db.getComboDishes(combo.id);
    const dishes = await db.getAllDishes();
    combo.dishes = comboDishesLinks.map(link => {
      const dishInfo = dishes.find(d => d.id === link.dish_id);
      return dishInfo ? {
        dish_id: dishInfo.id,
        name: dishInfo.name,
        quantity: link.quantity,
        price: dishInfo.price,
        image_url: dishInfo.image_url,
        is_available: dishInfo.is_available
      } : null;
    }).filter(d => d);
    successResponse(res, combo, 'Combo retrieved successfully');
  } catch (error) {
    console.error('获取单个套餐失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取单个套餐失败');
  }
};

/**
 * @desc    创建新套餐
 * @route   POST /api/combos
 */
const createCombo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || err);
    const { name, description, price, dishes: dishesInComboInput, is_enabled = true } = req.body;
    const image_url = req.file ? `/uploads/combos/${req.file.filename}` : null;
    let dishesInComboParsed = [];
    if (typeof dishesInComboInput === 'string') {
      try { dishesInComboParsed = JSON.parse(dishesInComboInput); } catch { dishesInComboParsed = []; }
    } else if (Array.isArray(dishesInComboInput)) {
      dishesInComboParsed = dishesInComboInput;
    }
    if (!name || price === undefined || !dishesInComboParsed || !Array.isArray(dishesInComboParsed) || dishesInComboParsed.length === 0) {
      if (image_url) await deleteFileIfExists(image_url);
      return errorResponse(res, 400, '套餐名称、价格和包含的菜品列表 (至少一项) 为必填项');
    }
    try {
      const allDishes = await db.getAllDishes({ is_available: true });
      for (const item of dishesInComboParsed) {
        if (!item.dish_id || !item.quantity || item.quantity < 1) {
          if (image_url) await deleteFileIfExists(image_url);
          return errorResponse(res, 400, '套餐中的菜品必须包含有效的dish_id和大于0的数量');
        }
        const dishExists = allDishes.find(d => d.id === item.dish_id);
        if (!dishExists) {
          if (image_url) await deleteFileIfExists(image_url);
          return errorResponse(res, 400, `套餐中包含的菜品ID ${item.dish_id} 不存在或已下架`);
        }
      }
      const existingCombos = await db.getAllCombos();
      if (existingCombos.find(c => c.name === name)) {
        if (image_url) await deleteFileIfExists(image_url);
        return errorResponse(res, 400, '已存在同名套餐');
      }
      const newCombo = {
        id: db.generateId(),
        name,
        description: description || null,
        price: parseFloat(price),
        image_url,
        is_enabled: Boolean(is_enabled),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await db.createCombo(newCombo);
      for (const item of dishesInComboParsed) {
        await db.addComboDish(newCombo.id, item.dish_id, item.quantity);
      }
      successResponse(res, { ...newCombo, dishes: dishesInComboParsed }, '套餐创建成功', 201);
    } catch (error) {
      console.error('创建套餐失败:', error.message);
      if (image_url) await deleteFileIfExists(image_url);
      errorResponse(res, 500, '服务器错误: 创建套餐失败');
    }
  });
};

/**
 * @desc    更新套餐信息
 * @route   PUT /api/combos/:id
 */
const updateCombo = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message || err);
    const { name, description, price, dishes: dishesInComboInput, is_enabled } = req.body;
    let dishesInComboParsed;
    console.log('[套餐更新] req.body:', req.body);
    if (dishesInComboInput !== undefined) {
      if (typeof dishesInComboInput === 'string') {
        try { dishesInComboParsed = JSON.parse(dishesInComboInput); } catch { return errorResponse(res, 400, '更新套餐中的菜品列表格式无效，应为JSON字符串数组'); }
      } else if (Array.isArray(dishesInComboInput)) {
        dishesInComboParsed = dishesInComboInput;
      } else {
        return errorResponse(res, 400, '更新套餐中的菜品列表格式无效');
      }
      if (!Array.isArray(dishesInComboParsed) || dishesInComboParsed.length === 0) {
        return errorResponse(res, 400, '套餐更新时，提供的菜品列表必须是包含至少一项的数组');
      }
    }
    try {
      const combo = await db.getComboById(id);
      if (!combo) {
        if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
        return errorResponse(res, 404, '套餐未找到');
      }
      let new_image_url = combo.image_url;
      if (req.file) {
        if (combo.image_url) await deleteFileIfExists(combo.image_url);
        new_image_url = `/uploads/combos/${req.file.filename}`;
      }
      if (name && name !== combo.name) {
        const allCombos = await db.getAllCombos();
        if (allCombos.find(c => c.id !== id && c.name === name)) {
          if (req.file && new_image_url !== combo.image_url) await deleteFileIfExists(new_image_url);
          return errorResponse(res, 400, '已存在另一个同名套餐');
        }
      }
      let enabled = combo.is_enabled;
      if (is_enabled !== undefined) {
        enabled = (is_enabled === true || is_enabled === 1 || is_enabled === '1' || is_enabled === 'true');
      }
      console.log(`[套餐更新] 解析 enabled:`, enabled, 'is_enabled:', is_enabled);
      const updates = {
        name: name || combo.name,
        description: description !== undefined ? description : combo.description,
        price: price !== undefined ? parseFloat(price) : combo.price,
        image_url: new_image_url,
        is_enabled: enabled,
      };
      console.log('[套餐更新] updates:', updates);
      const updateResult = await db.updateCombo(id, updates);
      console.log('[套餐更新] db.updateCombo result:', updateResult);
      if (dishesInComboParsed) {
        await db.removeComboDish(id);
        for (const item of dishesInComboParsed) {
          if (!item.dish_id || !item.quantity || item.quantity < 1) continue;
          await db.addComboDish(id, item.dish_id, item.quantity);
        }
      }
      const updatedCombo = await db.getComboById(id);
      const comboDishesLinks = await db.getComboDishes(id);
      updatedCombo.dishes = comboDishesLinks.map(link => ({ dish_id: link.dish_id, quantity: link.quantity }));
      updatedCombo.is_enabled = !!updatedCombo.is_enabled;
      console.log('[套餐更新] 返回 updatedCombo:', updatedCombo);
      successResponse(res, updatedCombo, '套餐更新成功');
    } catch (error) {
      console.error('更新套餐失败:', error.message);
      if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
      errorResponse(res, 500, '服务器错误: 更新套餐失败');
    }
  });
};

/**
 * @desc    删除套餐 (硬删除)
 * @route   DELETE /api/combos/:id
 */
const deleteCombo = async (req, res) => {
  const { id } = req.params;
  try {
    const combo = await db.getComboById(id);
    if (!combo) return errorResponse(res, 404, '套餐未找到');
    // 允许套餐直接删除，无论是否有菜品关联
    if (combo.image_url) await deleteFileIfExists(combo.image_url);
    await db.deleteCombo(id);
    await db.removeComboDish(id);
    successResponse(res, null, '套餐删除成功');
  } catch (error) {
    console.error('删除套餐失败:', error.message);
    errorResponse(res, 500, '服务器错误: 删除套餐失败');
  }
};

module.exports = {
  getAllCombos,
  getAllCombosAdmin,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  upload
};