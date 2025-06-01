const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const CART_MODEL_NAME = 'cartItems';
const DISH_MODEL_NAME = 'dishes';
const COMBO_MODEL_NAME = 'combos';

// 模拟登录用户 (后续替换为真实认证)
const DUMMY_USER_ID = "1";

/**
 * @desc    获取当前用户的购物车详情
 * @route   GET /api/cart
 */
const getCart = async (req, res) => {
  const userId = DUMMY_USER_ID;
  try {
    let cartItems = await readData(CART_MODEL_NAME);
    const userCartItems = cartItems.filter(item => item.user_id === userId);

    const dishes = await readData(DISH_MODEL_NAME);
    const combos = await readData(COMBO_MODEL_NAME);

    let totalAmount = 0;
    const processedCartItems = userCartItems.map(item => {
      let itemDetails = null;
      let unitPrice = 0;
      let itemName = '商品已下架或不存在';
      let itemImageUrl = null;
      let isAvailable = false;

      if (item.item_type === 'dish') {
        itemDetails = dishes.find(d => d.id === item.item_id);
        if (itemDetails && itemDetails.is_available) {
            unitPrice = itemDetails.price;
            itemName = itemDetails.name;
            itemImageUrl = itemDetails.image_url;
            isAvailable = true;
        }
      } else if (item.item_type === 'combo') {
        itemDetails = combos.find(c => c.id === item.item_id);
        if (itemDetails && itemDetails.is_available) {
            unitPrice = itemDetails.price;
            itemName = itemDetails.name;
            itemImageUrl = itemDetails.image_url;
            isAvailable = true;
        }
      }
      
      // 只有商品有效才计算价格
      const subTotal = isAvailable ? unitPrice * item.quantity : 0;
      if(isAvailable) totalAmount += subTotal;

      return {
        cart_item_id: item.id,
        ...item,
        item_name: itemName,
        unit_price: unitPrice,
        item_image_url: itemImageUrl,
        sub_total: subTotal,
        is_available: isAvailable // 添加一个字段表示该购物车项对应的商品当前是否有效
      };
    });
    
    // 过滤掉那些实际已不可用的商品项，确保购物车中只显示可购买的
    const finalCartItems = processedCartItems.filter(item => item.is_available);
    // 重新计算总价，因为过滤后可能总价会变
    totalAmount = finalCartItems.reduce((acc, item) => acc + item.sub_total, 0);

    successResponse(res, { items: finalCartItems, total_amount: parseFloat(totalAmount.toFixed(2)) });
  } catch (error) {
    console.error('获取购物车失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取购物车失败');
  }
};

/**
 * @desc    向购物车添加商品 (菜品或套餐)
 * @route   POST /api/cart
 * @body    { item_id, item_type ('dish' or 'combo'), quantity, flavor (optional) }
 */
const addItemToCart = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { item_id, item_type, quantity, flavor } = req.body;

  if (!item_id || !item_type || !quantity || parseInt(quantity) < 1) {
    return errorResponse(res, 400, '商品ID、类型和数量为必填项，且数量必须大于0');
  }
  if (!['dish', 'combo'].includes(item_type)) {
    return errorResponse(res, 400, "无效的商品类型，必须是 'dish' 或 'combo'");
  }

  try {
    let itemExistsAndAvailable = false;
    if (item_type === 'dish') {
      const dishes = await readData(DISH_MODEL_NAME);
      const dish = dishes.find(d => d.id === item_id && d.is_available);
      if (dish) itemExistsAndAvailable = true;
    } else {
      const combos = await readData(COMBO_MODEL_NAME);
      const combo = combos.find(c => c.id === item_id && c.is_available);
      if (combo) itemExistsAndAvailable = true;
    }

    if (!itemExistsAndAvailable) {
      return errorResponse(res, 404, '商品不存在或已下架');
    }

    let cartItems = await readData(CART_MODEL_NAME);
    let existingCartItemIndex = -1;

    if (item_type === 'dish') {
        existingCartItemIndex = cartItems.findIndex(item => 
            item.user_id === userId && 
            item.item_id === item_id && 
            item.item_type === item_type &&
            ( (flavor && item.flavor === flavor) || (!flavor && (!item.flavor || item.flavor === '')) )
        );
    } else { // 套餐不考虑口味
        existingCartItemIndex = cartItems.findIndex(item => 
            item.user_id === userId && 
            item.item_id === item_id && 
            item.item_type === item_type
        );
    }

    if (existingCartItemIndex > -1) {
      const newQuantity = cartItems[existingCartItemIndex].quantity + parseInt(quantity);
      cartItems[existingCartItemIndex].quantity = newQuantity;
      cartItems[existingCartItemIndex].added_at = new Date().toISOString();
      await writeData(CART_MODEL_NAME, cartItems);
      successResponse(res, { cart_item_id: cartItems[existingCartItemIndex].id, quantity: newQuantity }, '商品数量已更新');
    } else {
      const newCartItem = {
        id: generateId(),
        user_id: userId,
        item_id,
        item_type,
        quantity: parseInt(quantity),
        flavor: (item_type === 'dish' && flavor) ? flavor : null,
        added_at: new Date().toISOString(),
      };
      cartItems.push(newCartItem);
      await writeData(CART_MODEL_NAME, cartItems);
      successResponse(res, newCartItem, '商品已添加到购物车');
    }
  } catch (error) {
    console.error('添加到购物车失败:', error.message);
    errorResponse(res, 500, '服务器错误: 添加到购物车失败');
  }
};

/**
 * @desc    更新购物车中商品的数量或口味
 * @route   PUT /api/cart/:cart_item_id
 * @body    { quantity (optional), flavor (optional) }
 */
const updateCartItem = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { cart_item_id } = req.params;
  const { quantity, flavor } = req.body;

  if (quantity !== undefined && parseInt(quantity) < 1) {
    return errorResponse(res, 400, '数量必须大于或等于1');
  }
  if (quantity === undefined && flavor === undefined) {
    return errorResponse(res, 400, '没有提供可更新的字段 (数量或口味)');
  }

  try {
    let cartItems = await readData(CART_MODEL_NAME);
    const cartItemIndex = cartItems.findIndex(item => item.id === cart_item_id && item.user_id === userId);

    if (cartItemIndex === -1) {
      return errorResponse(res, 404, '购物车中未找到该商品');
    }

    let updated = false;
    if (quantity !== undefined) {
      cartItems[cartItemIndex].quantity = parseInt(quantity);
      updated = true;
    }
    if (flavor !== undefined && cartItems[cartItemIndex].item_type === 'dish') {
      cartItems[cartItemIndex].flavor = flavor || null;
      updated = true;
    }

    if (updated) {
        cartItems[cartItemIndex].added_at = new Date().toISOString(); // 更新时间戳
        await writeData(CART_MODEL_NAME, cartItems);
        successResponse(res, cartItems[cartItemIndex], '购物车商品已更新');
    } else {
        // 如果是套餐尝试更新口味，则不应视为有效更新
        return errorResponse(res, 400, '套餐不支持更新口味，或未提供有效更新字段')
    }

  } catch (error) {
    console.error('更新购物车商品失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新购物车商品失败');
  }
};

/**
 * @desc    从购物车移除指定商品项
 * @route   DELETE /api/cart/:cart_item_id
 */
const removeCartItem = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { cart_item_id } = req.params;

  try {
    let cartItems = await readData(CART_MODEL_NAME);
    const initialLength = cartItems.length;
    cartItems = cartItems.filter(item => !(item.id === cart_item_id && item.user_id === userId));

    if (cartItems.length === initialLength) {
      return errorResponse(res, 404, '购物车中未找到该商品或无权限操作');
    }

    await writeData(CART_MODEL_NAME, cartItems);
    successResponse(res, null, '商品已从购物车移除');
  } catch (error) {
    console.error('移除购物车商品失败:', error.message);
    errorResponse(res, 500, '服务器错误: 移除购物车商品失败');
  }
};

/**
 * @desc    清空当前用户的购物车
 * @route   DELETE /api/cart
 */
const clearCart = async (req, res) => {
  const userId = DUMMY_USER_ID;
  try {
    let cartItems = await readData(CART_MODEL_NAME);
    cartItems = cartItems.filter(item => item.user_id !== userId);
    await writeData(CART_MODEL_NAME, cartItems);
    successResponse(res, null, '购物车已清空');
  } catch (error) {
    console.error('清空购物车失败:', error.message);
    errorResponse(res, 500, '服务器错误: 清空购物车失败');
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
}; 