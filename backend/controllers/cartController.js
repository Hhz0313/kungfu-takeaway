const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// 测试用固定用户ID
const TEST_USER_ID = "1";

/**
 * @desc    获取当前用户的购物车详情
 * @route   GET /api/cart
 */
const getCart = async (req, res) => {
  const userId = TEST_USER_ID;
  console.log('[cartController] getCart: Starting with userId:', userId);
  try {
    console.log('[cartController] getCart: Fetching cart items from database...');
    const cartItems = await db.getCartItems(userId);
    console.log('[cartController] getCart: Raw cart items from database:', cartItems);
    
    let totalAmount = 0;
    const processedCartItems = cartItems.map(item => {
      const isDish = !!item.dish_id;
      const itemName = isDish ? item.dish_name : item.combo_name;
      const unitPrice = parseFloat(isDish ? item.dish_price : item.combo_price) || 0;
      const itemImageUrl = isDish ? item.dish_image : item.combo_image;
      const isAvailable = true; // 因为我们在查询时已经过滤了不可用的商品

      const subTotal = unitPrice * item.quantity;
      totalAmount += subTotal;

      return {
        cart_item_id: item.id,
        item_id: item.dish_id || item.combo_id,
        item_type: item.dish_id ? 'dish' : 'combo',
        quantity: parseInt(item.quantity) || 0,
        selected_flavors: item.selected_flavors ? JSON.parse(item.selected_flavors) : null,
        item_name: itemName || '未知商品',
        unit_price: unitPrice,
        item_image_url: itemImageUrl || '',
        sub_total: subTotal,
        is_available: isAvailable
      };
    });

    console.log('[cartController] getCart: Processed cart items:', processedCartItems);
    console.log('[cartController] getCart: Total amount:', totalAmount);

    successResponse(res, { items: processedCartItems, total_amount: parseFloat(totalAmount.toFixed(2)) });
  } catch (error) {
    console.error('[cartController] getCart: Error occurred:', error);
    console.error('[cartController] getCart: Error stack:', error.stack);
    errorResponse(res, 500, '服务器错误: 获取购物车失败');
  }
};

/**
 * @desc    向购物车添加商品 (菜品或套餐)
 * @route   POST /api/cart
 * @body    { item_id, item_type ('dish' or 'combo'), quantity, selected_flavors (optional) }
 */
const addItemToCart = async (req, res) => {
  const userId = TEST_USER_ID;
  const { item_id, item_type, quantity, selected_flavors } = req.body;

  if (!item_id || !item_type || !quantity || parseInt(quantity) < 1) {
    return errorResponse(res, 400, '商品ID、类型和数量为必填项，且数量必须大于0');
  }
  if (!['dish', 'combo'].includes(item_type)) {
    return errorResponse(res, 400, "无效的商品类型，必须是 'dish' 或 'combo'");
  }

  try {
    let itemExistsAndAvailable = false;
    if (item_type === 'dish') {
      const dish = await db.getDishById(item_id);
      if (dish && dish.is_available) itemExistsAndAvailable = true;
    } else {
      const combo = await db.getComboById(item_id);
      if (combo && combo.is_enabled) itemExistsAndAvailable = true;
    }

    if (!itemExistsAndAvailable) {
      return errorResponse(res, 404, '商品不存在或已下架');
    }

    const cartItems = await db.getCartItems(userId);
    let existingCartItem = null;

    if (item_type === 'dish') {
      existingCartItem = cartItems.find(item => 
        item.dish_id === item_id && 
        item.selected_flavors === (selected_flavors ? JSON.stringify(selected_flavors) : null)
      );
    } else {
      existingCartItem = cartItems.find(item => item.combo_id === item_id);
    }

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + parseInt(quantity);
      await db.updateCartItem(existingCartItem.id, { quantity: newQuantity });
      successResponse(res, { cart_item_id: existingCartItem.id, quantity: newQuantity }, '商品数量已更新');
    } else {
      const newCartItem = {
        user_id: userId,
        dish_id: item_type === 'dish' ? item_id : null,
        combo_id: item_type === 'combo' ? item_id : null,
        quantity: parseInt(quantity),
        selected_flavors: selected_flavors ? JSON.stringify(selected_flavors) : null
      };
      const result = await db.addCartItem(newCartItem);
      successResponse(res, { cart_item_id: result[0].id, ...newCartItem }, '商品已添加到购物车');
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    errorResponse(res, 500, '服务器错误: 添加到购物车失败');
  }
};

/**
 * @desc    更新购物车中商品的数量或口味
 * @route   PUT /api/cart/:cart_item_id
 * @body    { quantity (optional), selected_flavors (optional) }
 */
const updateCartItem = async (req, res) => {
  const userId = TEST_USER_ID;
  const { cart_item_id } = req.params;
  const { quantity, selected_flavors } = req.body;

  if (quantity !== undefined && parseInt(quantity) < 1) {
    return errorResponse(res, 400, '数量必须大于或等于1');
  }
  if (quantity === undefined && selected_flavors === undefined) {
    return errorResponse(res, 400, '没有提供可更新的字段 (数量或口味)');
  }

  try {
    const cartItems = await db.getCartItems(userId);
    const cartItem = cartItems.find(item => item.id === cart_item_id);

    if (!cartItem) {
      return errorResponse(res, 404, '购物车中未找到该商品');
    }

    const updates = {};
    if (quantity !== undefined) {
      updates.quantity = parseInt(quantity);
    }
    if (selected_flavors !== undefined && cartItem.dish_id) {
      updates.selected_flavors = JSON.stringify(selected_flavors);
    }

    if (Object.keys(updates).length > 0) {
      await db.updateCartItem(cart_item_id, updates);
      successResponse(res, { ...cartItem, ...updates }, '购物车商品已更新');
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
  const userId = TEST_USER_ID;
  const { cart_item_id } = req.params;

  try {
    const cartItems = await db.getCartItems(userId);
    const cartItem = cartItems.find(item => item.id === cart_item_id);

    if (!cartItem) {
      return errorResponse(res, 404, '购物车中未找到该商品');
    }

    await db.deleteCartItem(cart_item_id);
    successResponse(res, null, '商品已从购物车移除');
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
  const userId = TEST_USER_ID;
  try {
    await db.clearCart(userId);
    successResponse(res, null, '购物车已清空');
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