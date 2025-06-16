const knex = require('../utils/knex');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { randomUUID } = require('crypto');

/**
 * @desc    获取当前用户的购物车详情
 * @route   GET /api/cart
 */
const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cartItems = await knex('cart_items as ci')
      .select(
        'ci.id',
        'ci.quantity', 
        'ci.selected_flavors',
        'd.id as dish_id', 'd.name as dish_name', 'd.price as dish_price', 'd.image_url as dish_image', 'd.is_available',
        'c.id as combo_id', 'c.name as combo_name', 'c.price as combo_price', 'c.image_url as combo_image', 'c.is_enabled'
      )
      .leftJoin('dishes as d', 'ci.dish_id', 'd.id')
      .leftJoin('combos as c', 'ci.combo_id', 'c.id')
      .where('ci.user_id', userId);

    const processedItems = cartItems.filter(item => {
      // New robust filter:
      // An item is valid only if its corresponding dish/combo exists and is available/enabled.
      const isDishValid = item.dish_id != null && item.is_available;
      const isComboValid = item.combo_id != null && item.is_enabled;
      return isDishValid || isComboValid;
    }).map(item => {
      let flavors = [];
      try {
        if (item.selected_flavors) {
          flavors = JSON.parse(item.selected_flavors);
        }
      } catch (e) {
        console.error(`Error parsing flavors for cart item ${item.id}:`, item.selected_flavors);
      }
      return {
        id: item.id,
        quantity: item.quantity,
        selected_flavors: flavors,
        name: item.dish_name || item.combo_name,
        price: parseFloat(item.dish_price || item.combo_price || 0),
        image_url: item.dish_image || item.combo_image,
        type: item.dish_id ? 'dish' : 'combo',
        item_id: item.dish_id || item.combo_id,
      };
    });
    
    res.status(200).json(processedItems);
  } catch (error) {
    res.status(500).json({ message: '获取购物车信息失败', error: error.message });
  }
};

/**
 * @desc    向购物车添加商品 (菜品或套餐)
 * @route   POST /api/cart
 * @body    { item_id, item_type ('dish' or 'combo'), quantity, selected_flavors (optional) }
 */
const addItemToCart = async (req, res) => {
  const userId = req.user.id;
  const { item_id, item_type, quantity = 1, selected_flavors = [] } = req.body;

  if (!item_id || !item_type || quantity < 1) {
    return res.status(400).json({ message: '参数无效' });
  }

  const flavorsString = JSON.stringify(selected_flavors.sort((a,b) => a.name.localeCompare(b.name)));

  try {
    const existingItem = await knex('cart_items')
      .where({
        user_id: userId,
        [`${item_type}_id`]: item_id,
        // Using a direct string comparison for the JSON field.
        // This relies on the flavors being consistently ordered before stringification.
        selected_flavors: flavorsString,
      })
      .first();

    if (existingItem) {
      // Item exists, update quantity
      await knex('cart_items')
        .where({ id: existingItem.id })
        .increment('quantity', quantity);
      res.status(200).json({ message: '购物车已更新' });
    } else {
      // Item does not exist, insert new
      const cart_item_id = randomUUID();
      const newItem = {
        id: cart_item_id,
        user_id: userId,
        [`${item_type}_id`]: item_id,
        quantity: quantity,
        selected_flavors: flavorsString,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await knex('cart_items').insert(newItem);
      res.status(201).json({ message: '添加成功', cartItemId: cart_item_id });
    }
  } catch (error) {
    console.error('添加或更新购物车失败:', error);
    res.status(500).json({ message: '操作失败，请稍后再试', error: error.message });
  }
};

/**
 * @desc    更新购物车中商品的数量或口味
 * @route   PUT /api/cart/:cart_item_id
 * @body    { quantity (optional), selected_flavors (optional) }
 */
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { cart_item_id } = req.params;
  const { quantity } = req.body;

  if (quantity !== undefined && parseInt(quantity) < 1) {
    return errorResponse(res, 400, '数量必须大于或等于1');
  }
  if (quantity === undefined && req.body.selected_flavors === undefined) {
    return errorResponse(res, 400, '没有提供可更新的字段 (数量或口味)');
  }

  try {
    const cartItems = await knex('cart_items as ci')
      .select(
        'ci.id', 'ci.quantity', 'ci.selected_flavors',
        'd.id as dish_id', 'd.name as dish_name', 'd.price as dish_price', 'd.image_url as dish_image',
        'c.id as combo_id', 'c.name as combo_name', 'c.price as combo_price', 'c.image_url as combo_image'
      )
      .leftJoin('dishes as d', 'ci.dish_id', 'd.id')
      .leftJoin('combos as c', 'ci.combo_id', 'c.id')
      .where('ci.user_id', userId)
      .andWhere('ci.id', cart_item_id);

    if (cartItems.length === 0) {
      return errorResponse(res, 404, '购物车中未找到该商品');
    }

    const cartItem = cartItems[0];
    const updates = {};
    if (quantity !== undefined) {
      updates.quantity = parseInt(quantity);
    }
    if (req.body.selected_flavors !== undefined && cartItem.dish_id) {
      updates.selected_flavors = JSON.stringify(req.body.selected_flavors);
    }

    if (Object.keys(updates).length > 0) {
      await knex('cart_items').where({ id: cart_item_id, user_id: userId }).update(updates);
      res.status(200).json({ ...cartItem, ...updates });
    } else {
      return errorResponse(res, 400, '套餐不支持更新口味，或未提供有效更新字段');
    }
  } catch (error) {
    console.error('更新购物车商品失败:', error);
    errorResponse(res, 500, '服务器错误: 更新购物车商品失败');
  }
};

/**
 * @desc    从购物车移除指定商品项
 * @route   DELETE /api/cart/:cart_item_id
 */
const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { cart_item_id } = req.params;

  try {
    const numDeleted = await knex('cart_items').where({ id: cart_item_id, user_id: userId }).del();
    
    if (numDeleted > 0) {
      successResponse(res, { message: '已从购物车移除' }, 'Item removed successfully.');
    } else {
      errorResponse(res, 404, '未在购物车中找到该商品，或权限不足。');
    }
  } catch (error) {
    console.error('移除购物车商品失败:', error);
    errorResponse(res, 500, '服务器错误: 移除购物车商品失败');
  }
};

/**
 * @desc    清空当前用户的购物车
 * @route   DELETE /api/cart
 */
const clearCart = async (req, res) => {
  const userId = req.user.id;
  try {
    await knex('cart_items').where({ user_id: userId }).del();
    res.status(200).json({ message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败:', error);
    errorResponse(res, 500, '服务器错误: 清空购物车失败');
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
}; 