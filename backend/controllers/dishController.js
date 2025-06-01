const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Using synchronous fs for existsSync/unlinkSync for simplicity in multer callbacks
const fsp = require('fs').promises; // For deleting files asynchronously in controller actions

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
    cb(null, generateId() + path.extname(file.originalname)); // 使用自定义ID + 后缀名
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
 * @desc    获取所有可用菜品 (可选按分类过滤)
 * @route   GET /api/dishes
 * @route   GET /api/dishes?categoryId=some_category_id
 */
const getAllDishes = async (req, res) => {
  const { categoryId, canteenId } = req.query;
  try {
    let dishes = await readData(DISH_MODEL_NAME);
    const categories = await readData(CATEGORY_MODEL_NAME);
    const canteens = await readData(CANTEEN_MODEL_NAME);

    // Filter out non-available dishes and those belonging to disabled categories/canteens
    const enabledCategoryIds = categories.filter(c => c.is_enabled).map(c => c.id);
    const enabledCanteenIds = canteens.filter(can => can.is_enabled).map(can => can.id);

    let availableDishes = dishes.filter(d => 
        d.is_available && 
        enabledCategoryIds.includes(d.category_id) &&
        (!d.canteen_id || enabledCanteenIds.includes(d.canteen_id)) // If canteen_id is set, it must be enabled
    );

    if (categoryId) {
      availableDishes = availableDishes.filter(d => d.category_id === categoryId);
    }
    if (canteenId) {
        availableDishes = availableDishes.filter(d => d.canteen_id === canteenId);
    }

    // Add category name and canteen name
    availableDishes = availableDishes.map(dish => {
      const category = categories.find(c => c.id === dish.category_id);
      const canteen = canteens.find(can => can.id === dish.canteen_id);
      return {
        ...dish,
        category_name: category ? category.name : '未知分类',
        canteen_name: canteen ? canteen.name : (dish.canteen_id ? '未知食堂' : null),
        flavors: typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors,
      };
    });

    availableDishes.sort((a, b) => a.name.localeCompare(b.name));
    successResponse(res, availableDishes, 'Dishes retrieved successfully');
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
        let dishes = await readData(DISH_MODEL_NAME);
        const categories = await readData(CATEGORY_MODEL_NAME);
        const canteens = await readData(CANTEEN_MODEL_NAME);

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
    const dishes = await readData(DISH_MODEL_NAME);
    const dish = dishes.find(d => d.id === req.params.id);
    if (!dish) {
      return errorResponse(res, 404, '菜品未找到');
    }
    const categories = await readData(CATEGORY_MODEL_NAME);
    const canteens = await readData(CANTEEN_MODEL_NAME);

    const category = categories.find(c => c.id === dish.category_id);
    const canteen = canteens.find(can => can.id === dish.canteen_id);

    const dishDetail = {
        ...dish,
        category_name: category ? category.name : '未知分类',
        canteen_name: canteen ? canteen.name : (dish.canteen_id ? '未知食堂' : null),
        flavors: typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors,
    };
    successResponse(res, dishDetail, 'Dish retrieved successfully');
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
    if (err) {
      return errorResponse(res, 400, err.message || err);
    }

    const { category_id, name, description, price, flavors, is_available = true, canteen_id } = req.body;
    const image_url = req.file ? `/uploads/dishes/${req.file.filename}` : null;

    if (!category_id || !name || price === undefined) {
      if (image_url) await deleteFileIfExists(image_url);
      return errorResponse(res, 400, '分类ID、菜品名称和价格为必填项');
    }
    if (canteen_id === undefined) {
        // We'll treat it as required for now based on user request, but could be made optional.
        // For now, let's make it optional for creation
        // return errorResponse(res, '食堂ID为必填项', 400); 
    }

    try {
      const categories = await readData(CATEGORY_MODEL_NAME);
      const category = categories.find(c => c.id === category_id && c.is_enabled);
      if (!category) {
        if (image_url) await deleteFileIfExists(image_url);
        return errorResponse(res, 400, '分类未找到或已禁用');
      }

      if (canteen_id) {
          const canteens = await readData(CANTEEN_MODEL_NAME);
          const canteen = canteens.find(can => can.id === canteen_id && can.is_enabled);
          if (!canteen) {
              if (image_url) await deleteFileIfExists(image_url);
              return errorResponse(res, 400, '食堂未找到或已禁用');
          }
      }

      const dishes = await readData(DISH_MODEL_NAME);
      const existingDishByName = dishes.find(d => d.name === name && d.category_id === category_id && d.canteen_id === canteen_id);
      if (existingDishByName) {
        if (image_url) await deleteFileIfExists(image_url);
        return errorResponse(res, 409, '该分类和食堂下已存在同名菜品');
      }
      
      let parsedFlavors = [];
      if (typeof flavors === 'string') {
        try {
          parsedFlavors = JSON.parse(flavors);
          if (!Array.isArray(parsedFlavors)) {
            parsedFlavors = [parsedFlavors.toString()]; // If not an array after parsing, treat as single element array
          }
        } catch (e) {
          // If JSON.parse fails, and it's a non-empty string, try splitting by comma as a fallback for simple strings
          if (flavors.trim() !== '') {
             parsedFlavors = flavors.split(',').map(f => f.trim()).filter(f => f);
          }
        }
      } else if (Array.isArray(flavors)) {
        parsedFlavors = flavors.map(f => f.toString().trim()).filter(f => f);
      }

      const newDish = {
        id: generateId(),
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

      dishes.push(newDish);
      await writeData(DISH_MODEL_NAME, dishes);
      
      // Fetch category and canteen names for response
      const allCanteens = await readData(CANTEEN_MODEL_NAME); // Ensure canteens are fetched
      const newDishCanteen = newDish.canteen_id ? allCanteens.find(can => can.id === newDish.canteen_id) : null;

      const newDishWithDetails = {
        ...newDish,
        category_name: category.name, // category is already fetched and validated
        canteen_name: newDishCanteen ? newDishCanteen.name : null,
        // flavors are already parsed and stored in newDish (as JSON string)
      };

      successResponse(res, newDishWithDetails, '菜品创建成功', 201);
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
    if (err) {
      return errorResponse(res, 400, err.message || err);
    }

    const { category_id, name, description, price, flavors, is_available, canteen_id } = req.body;
    
    try {
      let dishes = await readData(DISH_MODEL_NAME);
      const dishIndex = dishes.findIndex(d => d.id === id);
      let newImageUrl = null;

      if (dishIndex === -1) {
        if (req.file) {
            newImageUrl = `/uploads/dishes/${req.file.filename}`;
            await deleteFileIfExists(newImageUrl);
        }
        return errorResponse(res, 404, '菜品未找到');
      }

      const originalDish = dishes[dishIndex];
      const updatedDish = { ...originalDish };

      if (req.file) {
        newImageUrl = `/uploads/dishes/${req.file.filename}`;
        if (originalDish.image_url && originalDish.image_url !== newImageUrl) {
          await deleteFileIfExists(originalDish.image_url);
        }
        updatedDish.image_url = newImageUrl;
      }

      if (category_id) {
        const categories = await readData(CATEGORY_MODEL_NAME);
        const category = categories.find(c => c.id === category_id && c.is_enabled);
        if (!category) {
          if (newImageUrl) await deleteFileIfExists(newImageUrl);
          return errorResponse(res, 400, '分类未找到或已禁用');
        }
        updatedDish.category_id = category_id;
      }
      
      if (canteen_id !== undefined) {
          if (canteen_id) {
            const canteens = await readData(CANTEEN_MODEL_NAME);
            const canteen = canteens.find(can => can.id === canteen_id && can.is_enabled);
            if (!canteen) {
                if (newImageUrl && newImageUrl !== originalDish.image_url) await deleteFileIfExists(newImageUrl);
                return errorResponse(res, 400, '食堂未找到或已禁用');
            }
          }
          updatedDish.canteen_id = canteen_id || null;
      }

      if (name) updatedDish.name = name;
      if (description !== undefined) updatedDish.description = description || null;
      if (price !== undefined) updatedDish.price = parseFloat(price);
      if (is_available !== undefined) updatedDish.is_available = Boolean(is_available);
      
      if ((name && name !== originalDish.name) || 
          (category_id && category_id !== originalDish.category_id) ||
          (canteen_id !== undefined && canteen_id !== originalDish.canteen_id) 
         ) {
          const conflictingDish = dishes.find(d => 
              d.id !== id &&
              d.name === updatedDish.name && 
              d.category_id === updatedDish.category_id &&
              d.canteen_id === updatedDish.canteen_id
          );
          if (conflictingDish) {
              if (newImageUrl && newImageUrl !== originalDish.image_url) await deleteFileIfExists(newImageUrl);
              return errorResponse(res, 409, '该分类和食堂下已存在同名菜品');
          }
      }

      // Ensure parsedFlavors is initialized before use
      let parsedFlavors; 
      if (flavors !== undefined) {
        // Existing logic for parsing flavors from request
        if (typeof flavors === 'string') {
          try {
            const tempFlavors = JSON.parse(flavors);
            if (Array.isArray(tempFlavors)) {
              parsedFlavors = tempFlavors.map(f => f.toString().trim()).filter(f => f);
            } else if (tempFlavors.toString().trim() !== '') {
              parsedFlavors = [tempFlavors.toString().trim()];
            } else {
              parsedFlavors = [];
            }
          } catch (e) {
            if (flavors.trim() !== '') {
              parsedFlavors = flavors.split(',').map(f => f.trim()).filter(f => f);
            } else {
              parsedFlavors = [];
            }
          }
        } else if (Array.isArray(flavors)) {
          parsedFlavors = flavors.map(f => f.toString().trim()).filter(f => f);
        } else {
            parsedFlavors = flavors.toString().trim() ? [flavors.toString().trim()] : [];
        }
      } else {
        // If flavors not in request, use existing ones (after parsing from string)
        try {
            parsedFlavors = typeof originalDish.flavors === 'string' ? JSON.parse(originalDish.flavors) : (originalDish.flavors || []);
        } catch(e) {
            parsedFlavors = []; // Default to empty if parsing original fails
        }
      }
      
      updatedDish.flavors = JSON.stringify(parsedFlavors);
      updatedDish.updated_at = new Date().toISOString();

      dishes[dishIndex] = updatedDish;
      await writeData(DISH_MODEL_NAME, dishes);

      // Fetch category and canteen names for response
      // Category:
      const categoriesForResponse = await readData(CATEGORY_MODEL_NAME);
      const categoryForResponse = categoriesForResponse.find(c => c.id === updatedDish.category_id);
      // Canteen:
      const canteensForResponse = await readData(CANTEEN_MODEL_NAME);
      const canteenForResponse = updatedDish.canteen_id ? canteensForResponse.find(can => can.id === updatedDish.canteen_id) : null;

      const updatedDishWithDetails = {
        ...updatedDish,
        category_name: categoryForResponse ? categoryForResponse.name : '未知分类',
        canteen_name: canteenForResponse ? canteenForResponse.name : null,
        // flavors are already stringified and stored in updatedDish
      };

      successResponse(res, updatedDishWithDetails, '菜品更新成功');
    } catch (error) {
      console.error('更新菜品失败:', error.message, error.stack);
      if (req.file && (!originalDish.image_url || (newImageUrl && newImageUrl !== originalDish.image_url) )) {
            await deleteFileIfExists(newImageUrl);
      }
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
    let dishes = await readData(DISH_MODEL_NAME);
    const dishIndex = dishes.findIndex(d => d.id === id);
    if (dishIndex === -1) {
      return errorResponse(res, 404, '菜品未找到');
    }

    const dishToDelete = dishes[dishIndex];

    // 检查菜品是否在任何套餐中
    const comboDishes = await readData(COMBO_DISHES_MODEL_NAME);
    if (comboDishes.some(cd => cd.dish_id === id)) {
      return errorResponse(res, 400, '无法删除菜品，因为它已关联到套餐中。请先从套餐中移除该菜品。');
    }

    // 删除菜品图片（如果存在）
    if (dishToDelete.image_url) {
      await deleteFileIfExists(dishToDelete.image_url);
    }

    dishes.splice(dishIndex, 1);
    await writeData(DISH_MODEL_NAME, dishes);
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