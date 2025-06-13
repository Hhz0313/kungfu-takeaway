const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

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
    const address = await db.getAddressById(address_id);
    if (!address || address.user_id !== userId) {
      return errorResponse(res, 404, '无效的收货地址或地址不属于当前用户');
    }
    const cartItems = await db.getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return errorResponse(res, 400, '购物车为空，无法创建订单');
    }
    let totalAmount = 0;
    const orderItemsData = [];
    for (const item of cartItems) {
      let productDetails = null;
      let unitPrice = 0;
      let isAvailable = false;
      if (item.item_type === 'dish') {
        productDetails = await db.getDishById(item.item_id);
        if (productDetails && productDetails.is_available) {
          unitPrice = productDetails.price;
          isAvailable = true;
        }
      } else if (item.item_type === 'combo') {
        productDetails = await db.getComboById(item.item_id);
        if (productDetails && productDetails.is_enabled) {
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
        id: db.generateId(),
        item_type: item.item_type,
        item_id: item.item_id,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(unitPrice),
        sub_total: parseFloat(subTotal.toFixed(2)),
        flavor: item.flavor || null,
      });
    }
    totalAmount = parseFloat(totalAmount.toFixed(2));
    const newOrderId = db.generateId();
    const newOrder = {
      id: newOrderId,
      user_id: userId,
      address_id,
      total_amount: totalAmount,
      payment_method,
      notes: notes || null,
      status: 'pending',
      payment_status: 'unpaid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.getAllOrders().then(async all => {
      await require('../utils/knex')('orders').insert(newOrder);
    });
    for (const item of orderItemsData) {
      item.order_id = newOrderId;
      await require('../utils/knex')('order_items').insert(item);
    }
    await db.clearCart(userId);
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
    const order = await require('../utils/knex')('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    if (order.payment_status === 'paid') return errorResponse(res, 400, '订单已支付');
    await require('../utils/knex')('orders').where({ id: order_id }).update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() });
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
    const order = await require('../utils/knex')('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    await require('../utils/knex')('orders').where({ id: order_id }).update({ payment_status: 'failed', updated_at: new Date().toISOString() });
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
    let orders = await require('../utils/knex')('orders').where({ user_id: userId }).select();
    orders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    successResponse(res, orders);
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
    const order = await require('../utils/knex')('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    let orderItems = await require('../utils/knex')('order_items').where({ order_id }).select();
    for (let i = 0; i < orderItems.length; i++) {
      let item = orderItems[i];
      let productDetails = null;
      let itemName = '商品信息缺失';
      let itemImageUrl = null;
      if (item.item_type === 'dish') {
        productDetails = await db.getDishById(item.item_id);
        if (productDetails) {
          itemName = productDetails.name;
          itemImageUrl = productDetails.image_url;
        }
      } else if (item.item_type === 'combo') {
        productDetails = await db.getComboById(item.item_id);
        if (productDetails) {
          itemName = productDetails.name;
          itemImageUrl = productDetails.image_url;
        }
      }
      orderItems[i] = { ...item, item_name: itemName, item_image_url: itemImageUrl };
    }
    const shippingAddress = await db.getAddressById(order.address_id);
    successResponse(res, { ...order, items: orderItems, shipping_address: shippingAddress });
  } catch (error) {
    console.error('获取订单详情失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取订单详情失败');
  }
};

/**
 * @desc    获取所有订单 (管理员/员工)
 * @route   GET /api/orders/admin/all
 * @query   status (optional) - 按状态筛选订单
 */
const getAllOrdersAdmin = async (req, res) => {
  const { status } = req.query;
  try {
    let orders = status ? await require('../utils/knex')('orders').where({ status }).select() : await require('../utils/knex')('orders').select();
    orders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const allUsers = await require('../utils/knex')('users').select();
    const allAddresses = await require('../utils/knex')('addresses').select();
    const allOrderItems = await require('../utils/knex')('order_items').select();
    const allDishes = await require('../utils/knex')('dishes').select();
    const allCombos = await require('../utils/knex')('combos').select();
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
    const order = await require('../utils/knex')('orders').where({ id: order_id }).first();
    if (!order) return errorResponse(res, 404, '订单未找到');
    await require('../utils/knex')('orders').where({ id: order_id }).update({ status, updated_at: new Date().toISOString() });
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