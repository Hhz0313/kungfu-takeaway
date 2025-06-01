const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const ORDER_MODEL_NAME = 'orders';
const ORDER_ITEM_MODEL_NAME = 'orderItems';
const CART_MODEL_NAME = 'cartItems';
const ADDRESS_MODEL_NAME = 'addresses';
const USER_MODEL_NAME = 'users'; // For user details in admin view
const DISH_MODEL_NAME = 'dishes';
const COMBO_MODEL_NAME = 'combos';

// 模拟登录用户
const DUMMY_USER_ID = "1";

/**
 * @desc    创建新订单 (从购物车)
 * @route   POST /api/orders
 * @body    { address_id, payment_method, notes (optional) }
 */
const createOrder = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { address_id, payment_method, notes } = req.body;

  if (!address_id || !payment_method) {
    return errorResponse(res, 400, '收货地址和支付方式为必填项');
  }

  try {
    const allAddresses = await readData(ADDRESS_MODEL_NAME);
    const address = allAddresses.find(addr => addr.id === address_id && addr.user_id === userId);
    if (!address) {
      return errorResponse(res, 404, '无效的收货地址或地址不属于当前用户');
    }

    let cartItems = await readData(CART_MODEL_NAME);
    const userCartItems = cartItems.filter(item => item.user_id === userId);
    if (userCartItems.length === 0) {
      return errorResponse(res, 400, '购物车为空，无法创建订单');
    }

    const dishes = await readData(DISH_MODEL_NAME);
    const combos = await readData(COMBO_MODEL_NAME);
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of userCartItems) {
      let productDetails = null;
      let unitPrice = 0;
      let isAvailable = false;

      if (item.item_type === 'dish') {
        productDetails = dishes.find(d => d.id === item.item_id);
        if (productDetails && productDetails.is_available) {
            unitPrice = productDetails.price;
            isAvailable = true;
        }
      } else if (item.item_type === 'combo') {
        productDetails = combos.find(c => c.id === item.item_id);
        // For combos, also check if all contained dishes are available
        if (productDetails && productDetails.is_available) {
            // This simplified check assumes combo availability implies its dishes are available
            // A more robust check would iterate through combo_dishes like in comboController.getAllCombos
            unitPrice = productDetails.price;
            isAvailable = true;
        }
      }

      if (!isAvailable || !productDetails) {
        return errorResponse(res, 400, `购物车中的商品ID ${item.item_id} (${item.item_type}) 已下架或信息错误，请先移除`);
      }
      const subTotal = parseFloat(unitPrice) * parseInt(item.quantity);
      totalAmount += subTotal;
      orderItemsData.push({
        id: generateId(), // ID for order_item
        item_type: item.item_type,
        item_id: item.item_id,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(unitPrice),
        sub_total: parseFloat(subTotal.toFixed(2)),
        flavor: item.flavor || null,
      });
    }
    totalAmount = parseFloat(totalAmount.toFixed(2));

    const orders = await readData(ORDER_MODEL_NAME);
    const newOrderId = generateId();
    const newOrder = {
      id: newOrderId,
      user_id: userId,
      address_id,
      total_amount: totalAmount,
      payment_method,
      notes: notes || null,
      status: 'pending', // 初始状态
      payment_status: 'unpaid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.push(newOrder);
    await writeData(ORDER_MODEL_NAME, orders);

    let allOrderItems = await readData(ORDER_ITEM_MODEL_NAME);
    orderItemsData.forEach(item => item.order_id = newOrderId);
    allOrderItems.push(...orderItemsData);
    await writeData(ORDER_ITEM_MODEL_NAME, allOrderItems);

    // 清空购物车
    const remainingCartItems = cartItems.filter(item => item.user_id !== userId);
    await writeData(CART_MODEL_NAME, remainingCartItems);

    successResponse(res, { order_id: newOrderId, total_amount: totalAmount, status: 'pending', payment_status: 'unpaid' }, '订单创建成功，等待支付');
  } catch (error) {
    console.error('创建订单失败:', error.message);
    errorResponse(res, 500, '服务器错误: 创建订单失败');
  }
};

/**
 * @desc    模拟支付接口 - 支付成功
 * @route   POST /api/orders/:order_id/pay/success
 */
const simulatePaymentSuccess = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { order_id } = req.params;

  try {
    let orders = await readData(ORDER_MODEL_NAME);
    const orderIndex = orders.findIndex(o => o.id === order_id && o.user_id === userId);
    if (orderIndex === -1) {
      return errorResponse(res, 404, '订单未找到或不属于当前用户');
    }
    if (orders[orderIndex].payment_status === 'paid') {
      return errorResponse(res, 400, '订单已支付');
    }

    orders[orderIndex].payment_status = 'paid';
    orders[orderIndex].status = 'confirmed'; // 支付成功后，订单状态变为已确认
    orders[orderIndex].updated_at = new Date().toISOString();
    await writeData(ORDER_MODEL_NAME, orders);

    successResponse(res, { order_id, payment_status: 'paid', status: 'confirmed' }, '支付成功，订单已确认');
  } catch (error) {
    console.error('模拟支付成功失败:', error.message);
    errorResponse(res, 500, '服务器错误: 模拟支付成功失败');
  }
};

/**
 * @desc    模拟支付接口 - 支付失败
 * @route   POST /api/orders/:order_id/pay/failure
 */
const simulatePaymentFailure = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { order_id } = req.params;

  try {
    let orders = await readData(ORDER_MODEL_NAME);
    const orderIndex = orders.findIndex(o => o.id === order_id && o.user_id === userId);
    if (orderIndex === -1) {
      return errorResponse(res, 404, '订单未找到或不属于当前用户');
    }
    orders[orderIndex].payment_status = 'failed';
    // 支付失败通常不改变订单主状态，或有特定 'payment_failed' 状态
    orders[orderIndex].updated_at = new Date().toISOString();
    await writeData(ORDER_MODEL_NAME, orders);

    successResponse(res, { order_id, payment_status: 'failed' }, '支付失败');
  } catch (error) {
    console.error('模拟支付失败处理失败:', error.message);
    errorResponse(res, 500, '服务器错误: 模拟支付失败处理失败');
  }
};

/**
 * @desc    获取当前用户的订单历史
 * @route   GET /api/orders/history
 */
const getOrderHistory = async (req, res) => {
  const userId = DUMMY_USER_ID;
  try {
    const orders = await readData(ORDER_MODEL_NAME);
    const userOrders = orders.filter(o => o.user_id === userId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    successResponse(res, userOrders);
  } catch (error) {
    console.error('获取订单历史失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取订单历史失败');
  }
};

/**
 * @desc    获取特定订单详情 (顾客)
 * @route   GET /api/orders/:order_id
 */
const getOrderDetails = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { order_id } = req.params;
  try {
    const orders = await readData(ORDER_MODEL_NAME);
    const order = orders.find(o => o.id === order_id && o.user_id === userId);
    if (!order) {
      return errorResponse(res, 404, '订单未找到或不属于当前用户');
    }

    const allOrderItems = await readData(ORDER_ITEM_MODEL_NAME);
    let orderItems = allOrderItems.filter(item => item.order_id === order_id);

    const dishes = await readData(DISH_MODEL_NAME);
    const combos = await readData(COMBO_MODEL_NAME);

    orderItems = orderItems.map(item => {
        let productDetails = null;
        let itemName = '商品信息缺失';
        let itemImageUrl = null;
        if (item.item_type === 'dish') {
            productDetails = dishes.find(d => d.id === item.item_id);
            if (productDetails) {
                itemName = productDetails.name;
                itemImageUrl = productDetails.image_url;
            }
        } else if (item.item_type === 'combo') {
            productDetails = combos.find(c => c.id === item.item_id);
            if (productDetails) {
                itemName = productDetails.name;
                itemImageUrl = productDetails.image_url;
            }
        }
        return {
            ...item,
            item_name: itemName,
            item_image_url: itemImageUrl,
        };
    });

    const allAddresses = await readData(ADDRESS_MODEL_NAME);
    const shippingAddress = allAddresses.find(addr => addr.id === order.address_id);

    successResponse(res, { ...order, items: orderItems, shipping_address: shippingAddress });
  } catch (error) {
    console.error('获取订单详情失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取订单详情失败');
  }
};

// --- 管理员/员工端接口 ---

/**
 * @desc    获取所有订单 (管理员/员工)
 * @route   GET /api/orders/admin/all
 * @query   status (optional) - 按状态筛选订单
 */
const getAllOrdersAdmin = async (req, res) => {
  const { status } = req.query;
  try {
    let orders = await readData(ORDER_MODEL_NAME);
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    orders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    const allUsers = await readData(USER_MODEL_NAME);
    const allAddresses = await readData(ADDRESS_MODEL_NAME);
    const allOrderItems = await readData(ORDER_ITEM_MODEL_NAME);
    const allDishes = await readData(DISH_MODEL_NAME);
    const allCombos = await readData(COMBO_MODEL_NAME);

    const processedOrders = orders.map(order => {
      const customer = allUsers.find(u => u.id === order.user_id) || { username: '未知用户' };
      const address = allAddresses.find(a => a.id === order.address_id) || { recipient_name: 'N/A', phone_number: 'N/A', address_line1: 'N/A' }; 
      
      let items = allOrderItems.filter(item => item.order_id === order.id);
      items = items.map(item => {
          let itemName = '商品信息缺失';
          if (item.item_type === 'dish') {
              const dish = allDishes.find(d => d.id === item.item_id);
              if (dish) itemName = dish.name;
          } else if (item.item_type === 'combo') {
              const combo = allCombos.find(c => c.id === item.item_id);
              if (combo) itemName = combo.name;
          }
          return { ...item, item_name: itemName }; 
      });

      return {
        ...order,
        customer_username: customer.username,
        recipient_name: address.recipient_name,
        phone_number: address.phone_number,
        address_line1: address.address_line1, 
        items: items,
      };
    });

    successResponse(res, processedOrders);
  } catch (error) {
    console.error('管理员获取所有订单失败:', error.message);
    errorResponse(res, 500, '服务器错误: 管理员获取所有订单失败');
  }
};

/**
 * @desc    更新订单状态 (管理员/员工)
 * @route   PUT /api/orders/admin/:order_id/status
 * @body    { status } - 新的订单状态 ('confirmed', 'preparing', 'delivering', 'completed', 'cancelled')
 */
const updateOrderStatusAdmin = async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return errorResponse(res, 400, `无效的订单状态，必须是以下之一: ${validStatuses.join(', ')}`);
  }

  try {
    let orders = await readData(ORDER_MODEL_NAME);
    const orderIndex = orders.findIndex(o => o.id === order_id);
    if (orderIndex === -1) {
      return errorResponse(res, 404, '订单未找到');
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    await writeData(ORDER_MODEL_NAME, orders);

    successResponse(res, { order_id, status }, '订单状态更新成功');
  } catch (error) {
    console.error('管理员更新订单状态失败:', error.message);
    errorResponse(res, 500, '服务器错误: 管理员更新订单状态失败');
  }
};

module.exports = {
  createOrder,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getOrderHistory,
  getOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
}; 