const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Sync for uploads dir check
const fsp = require('fs').promises; // Async for file operations

const COMBO_MODEL_NAME = 'combos';
const DISH_MODEL_NAME = 'dishes';
const COMBO_DISHES_MODEL_NAME = 'comboDishes';

// 确保套餐图片上传目录存在
const uploadsDir = path.join(__dirname, '../uploads/combos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, generateId() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 限制
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

// 辅助函数：删除文件（如果存在）
async function deleteFileIfExists(filePath) {
    if (!filePath) return;
    const absolutePath = path.join(__dirname, '../', filePath);
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
    let combos = await readData(COMBO_MODEL_NAME);
    const availableCombos = combos.filter(c => c.is_available);
    
    // 为每个可用套餐附加其包含的菜品信息
    const dishes = await readData(DISH_MODEL_NAME);
    const comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);

    for (let combo of availableCombos) {
      const relatedDishLinks = comboDishesLinks.filter(link => link.combo_id === combo.id);
      combo.dishes = relatedDishLinks.map(link => {
        const dishInfo = dishes.find(d => d.id === link.dish_id && d.is_available);
        return dishInfo ? { 
            dish_id: dishInfo.id, 
            name: dishInfo.name, 
            quantity: link.quantity,
            price: dishInfo.price, // 单品价格
            image_url: dishInfo.image_url
        } : null;
      }).filter(d => d !== null); // 过滤掉找不到或不可用的菜品
      // 如果套餐中包含任何一个已下架的菜品，则该套餐不应显示 (或者根据业务需求处理)
      if (combo.dishes.length !== relatedDishLinks.length) {
          combo.contains_unavailable_items = true; // 标记套餐含有不可用菜品
          // 根据产品策略，可以选择不显示此套餐或特殊标记
      }
    }
    // 再次过滤，只显示不包含不可用菜品的套餐 (如果策略如此)
    const finalCombos = availableCombos.filter(c => !c.contains_unavailable_items);

    successResponse(res, finalCombos.sort((a,b) => a.name.localeCompare(b.name)), 'Combos retrieved successfully');
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
        let combos = await readData(COMBO_MODEL_NAME);
        const dishes = await readData(DISH_MODEL_NAME);
        const comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);

        for (let combo of combos) {
            const relatedDishLinks = comboDishesLinks.filter(link => link.combo_id === combo.id);
            combo.dishes = relatedDishLinks.map(link => {
                const dishInfo = dishes.find(d => d.id === link.dish_id);
                return dishInfo ? { 
                    dish_id: dishInfo.id, 
                    name: dishInfo.name, 
                    quantity: link.quantity 
                } : { dish_id: link.dish_id, name: '[菜品已删除或ID错误]', quantity: link.quantity };
            });
        }
        successResponse(res, combos.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)), 'All combos retrieved successfully for admin');
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
    const combos = await readData(COMBO_MODEL_NAME);
    const combo = combos.find(c => c.id === req.params.id);
    if (!combo) {
      return errorResponse(res, 404, '套餐未找到');
    }

    const dishes = await readData(DISH_MODEL_NAME);
    const comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);
    const relatedDishLinks = comboDishesLinks.filter(link => link.combo_id === combo.id);
    
    combo.dishes = relatedDishLinks.map(link => {
      const dishInfo = dishes.find(d => d.id === link.dish_id);
      return dishInfo ? { 
        dish_id: dishInfo.id, 
        name: dishInfo.name, 
        quantity: link.quantity, 
        price: dishInfo.price,
        image_url: dishInfo.image_url,
        is_available: dishInfo.is_available // 包含菜品是否可用状态
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
 * @body    { name, description, price, dishes: [{dish_id, quantity}], is_available }
 */
const createCombo = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || err);
    }

    const { name, description, price, dishes: dishesInComboInput, is_available = true } = req.body;
    const image_url = req.file ? `/uploads/combos/${req.file.filename}` : null;

    let dishesInComboParsed = [];
    if (typeof dishesInComboInput === 'string') {
      try {
        dishesInComboParsed = JSON.parse(dishesInComboInput);
      } catch (e) {
        if (image_url) await deleteFileIfExists(image_url);
        return errorResponse(res, 400, '套餐中的菜品列表格式无效，应为JSON字符串数组');
      }
    } else if (Array.isArray(dishesInComboInput)) {
      dishesInComboParsed = dishesInComboInput;
    }

    if (!name || price === undefined || !dishesInComboParsed || !Array.isArray(dishesInComboParsed) || dishesInComboParsed.length === 0) {
      if (image_url) await deleteFileIfExists(image_url);
      return errorResponse(res, 400, '套餐名称、价格和包含的菜品列表 (至少一项) 为必填项');
    }

    try {
      const allDishes = await readData(DISH_MODEL_NAME);
      // Check for combo name duplication
      const existingCombos = await readData(COMBO_MODEL_NAME);
      if (existingCombos.some(c => c.name === name)) {
        if (image_url) await deleteFileIfExists(image_url);
        return errorResponse(res, 400, '已存在同名套餐');
      }

      for (const item of dishesInComboParsed) {
        if (!item.dish_id || !item.quantity || item.quantity < 1) {
            if (image_url) await deleteFileIfExists(image_url);
            return errorResponse(res, 400, '套餐中的菜品必须包含有效的dish_id和大于0的数量');
        }
        const dishExists = allDishes.find(d => d.id === item.dish_id && d.is_available);
        if (!dishExists) {
          if (image_url) await deleteFileIfExists(image_url);
          return errorResponse(res, 404, `套餐中包含的菜品ID ${item.dish_id} 不存在或已下架`);
        }
      }

      let combos = await readData(COMBO_MODEL_NAME);
      const newComboId = generateId();
      const newCombo = {
        id: newComboId,
        name,
        description: description || null,
        price: parseFloat(price),
        image_url,
        is_available: Boolean(is_available),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      combos.push(newCombo);
      await writeData(COMBO_MODEL_NAME, combos);

      let comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);
      const newComboDishLinks = dishesInComboParsed.map(item => ({
        id: generateId(), // ID for the link itself
        combo_id: newComboId,
        dish_id: item.dish_id,
        quantity: parseInt(item.quantity),
      }));
      comboDishesLinks.push(...newComboDishLinks);
      await writeData(COMBO_DISHES_MODEL_NAME, comboDishesLinks);

      successResponse(res, { ...newCombo, dishes: newComboDishLinks }, '套餐创建成功', 201);
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
 * @body    { name, description, price, dishes: [{dish_id, quantity}], is_available }
 */
const updateCombo = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message || err);
    }

    const { name, description, price, dishes: dishesInComboInput, is_available } = req.body;

    let dishesInComboParsed;
    if (dishesInComboInput !== undefined) { // Only parse if provided
      if (typeof dishesInComboInput === 'string') {
        try {
          dishesInComboParsed = JSON.parse(dishesInComboInput);
        } catch (e) {
          if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
          return errorResponse(res, 400, '更新套餐中的菜品列表格式无效，应为JSON字符串数组');
        }
      } else if (Array.isArray(dishesInComboInput)) {
        dishesInComboParsed = dishesInComboInput;
      } else {
        if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
        return errorResponse(res, 400, '更新套餐中的菜品列表格式无效');
      }
       // Validate parsed dishes structure only if dishesInComboParsed is set (i.e., input was provided)
      if (dishesInComboParsed && (!Array.isArray(dishesInComboParsed) || dishesInComboParsed.length === 0)) {
        if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
        return errorResponse(res, 400, '套餐更新时，提供的菜品列表必须是包含至少一项的数组');
      }
    }

    try {
      let combos = await readData(COMBO_MODEL_NAME);
      const comboIndex = combos.findIndex(c => c.id === id);
      if (comboIndex === -1) {
        if (req.file) await deleteFileIfExists(`/uploads/combos/${req.file.filename}`);
        return errorResponse(res, 404, '套餐未找到');
      }

      const originalCombo = combos[comboIndex];
      let new_image_url = originalCombo.image_url;

      if (req.file) {
        if (originalCombo.image_url) {
          await deleteFileIfExists(originalCombo.image_url);
        }
        new_image_url = `/uploads/combos/${req.file.filename}`;
      }
      
      if (name && name !== originalCombo.name) {
        const allCombos = await readData(COMBO_MODEL_NAME);
        if (allCombos.some(c => c.id !== id && c.name === name)) {
            if (req.file && new_image_url !== originalCombo.image_url) await deleteFileIfExists(new_image_url);
            return errorResponse(res, 400, '已存在另一个同名套餐');
        }
      }

      const updatedCombo = {
        ...originalCombo,
        name: name || originalCombo.name,
        description: description !== undefined ? description : originalCombo.description,
        price: price !== undefined ? parseFloat(price) : originalCombo.price,
        image_url: new_image_url,
        is_available: is_available !== undefined ? Boolean(is_available) : originalCombo.is_available,
        updated_at: new Date().toISOString(),
      };
      combos[comboIndex] = updatedCombo;
      await writeData(COMBO_MODEL_NAME, combos);

      // 更新套餐菜品关联
      if (dishesInComboParsed) { // dishesInComboParsed will be undefined if not in request
        let comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);
        // 移除旧的关联
        comboDishesLinks = comboDishesLinks.filter(link => link.combo_id !== id);
        // 添加新的关联 (如果dishesInComboParsed不是空数组)
        if (dishesInComboParsed.length > 0) {
            const newComboDishLinks = dishesInComboParsed.map(item => ({
                id: generateId(),
                combo_id: id,
                dish_id: item.dish_id,
                quantity: parseInt(item.quantity),
            }));
            comboDishesLinks.push(...newComboDishLinks);
        }
        await writeData(COMBO_DISHES_MODEL_NAME, comboDishesLinks);
        updatedCombo.dishes = dishesInComboParsed; // 返回更新后的菜品列表
      } else {
        // 如果不提供dishesInCombo，则保持原有关联，并从数据库中读取展示
        let existingComboDishes = await readData(COMBO_DISHES_MODEL_NAME);
        updatedCombo.dishes = existingComboDishes.filter(link => link.combo_id === id).map(item => ({dish_id: item.dish_id, quantity: item.quantity}));
      }

      successResponse(res, { ...updatedCombo, dishes: dishesInComboParsed }, '套餐更新成功');
    } catch (error) {
      console.error('更新套餐失败:', error.message);
       if (req.file && new_image_url && new_image_url !== originalCombo.image_url) {
          await deleteFileIfExists(new_image_url);
      }
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
    let combos = await readData(COMBO_MODEL_NAME);
    const comboIndex = combos.findIndex(c => c.id === id);
    if (comboIndex === -1) {
      return errorResponse(res, 404, '套餐未找到');
    }

    const comboToDelete = combos[comboIndex];
    if (comboToDelete.image_url) {
      await deleteFileIfExists(comboToDelete.image_url);
    }
    combos.splice(comboIndex, 1);
    await writeData(COMBO_MODEL_NAME, combos);

    // 删除关联的 combo_dishes 条目
    let comboDishesLinks = await readData(COMBO_DISHES_MODEL_NAME);
    const updatedComboDishes = comboDishesLinks.filter(link => link.combo_id !== id);
    await writeData(COMBO_DISHES_MODEL_NAME, updatedComboDishes);

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
}; 