const db = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const knex = require('../utils/knex');

/**
 * @desc    创建新订单 (从购物车)
 * @route   POST /api/orders
 * @body    { address_id, payment_method, notes (optional) }
 */
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { addressId, paymentMethod, remark } = req.body;

  if (!addressId || !paymentMethod) {
    return res.status(400).json({ message: '收货地址和支付方式为必填项' });
  }

  try {
    const trx = await knex.transaction();

    try {
      // 1. 验证地址
      const address = await trx('addresses').where({ id: addressId, user_id: userId }).first();
      if (!address) {
        throw new Error('无效的收货地址');
      }

      // 2. 获取购物车商品
      const cartItems = await trx('cart_items').where({ user_id: userId });
      if (cartItems.length === 0) {
        throw new Error('购物车为空');
      }

      // 3. 计算总价并准备订单项
      let totalAmount = 0;
      const orderItemsData = [];
      for (const item of cartItems) {
        let details, price;
        if (item.dish_id) {
          details = await trx('dishes').where({ id: item.dish_id }).first();
          price = details?.is_available ? details.price : null;
        } else {
          details = await trx('combos').where({ id: item.combo_id }).first();
          price = details?.is_enabled ? details.price : null;
        }

        if (!price) {
          throw new Error(`商品 ${details?.name || 'ID:'+ (item.dish_id || item.combo_id)} 已下架`);
        }
        
        totalAmount += price * item.quantity;
        orderItemsData.push({
          order_id: null, // to be set later
          dish_id: item.dish_id,
          combo_id: item.combo_id,
          quantity: item.quantity,
          price: price,
          selected_flavors: item.selected_flavors,
        });
      }

      totalAmount = parseFloat(totalAmount.toFixed(2));
      let paymentStatus = 'unpaid';
      let orderStatus = 'pending';

      // 4. 处理余额支付
      if (paymentMethod === 'balance') {
        const user = await trx('users').where({ id: userId }).first();
        if (user.balance < totalAmount) {
          throw new Error('账户余额不足');
        }
        await trx('users').where({ id: userId }).decrement('balance', totalAmount);
        paymentStatus = 'paid';
        orderStatus = 'preparing'; // 已支付，直接进入准备中状态
      }

      // 5. 创建订单
      const orderId = require('uuid').v4();
      await trx('orders').insert({
        id: orderId,
        user_id: userId,
        address_id: addressId,
        total_amount: totalAmount,
        status: orderStatus,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        remark: remark,
      });

      // 6. 插入订单项
      for (const item of orderItemsData) {
        item.order_id = orderId;
      }
      await trx('order_items').insert(orderItemsData);

      // 7. 清空购物车
      await trx('cart_items').where({ user_id: userId }).del();

      // 提交事务
      await trx.commit();
      
      res.status(201).json({ message: '订单创建成功', orderId: orderId });

    } catch (error) {
      await trx.rollback();
      res.status(400).json({ message: error.message || '订单创建失败' });
    }
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

/**
 * @desc    模拟支付接口 - 支付成功
 * @route   POST /api/orders/:order_id/pay/success
 */
const simulatePaymentSuccess = async (req, res) => {
  const userId = req.user.id;
  const { order_id } = req.params;
  try {
    const order = await knex('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    if (order.payment_status === 'paid') return errorResponse(res, 400, '订单已支付');
    await knex('orders').where({ id: order_id }).update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() });
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
  const userId = req.user.id;
  const { order_id } = req.params;
  try {
    const order = await knex('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    await knex('orders').where({ id: order_id }).update({ payment_status: 'failed', updated_at: new Date().toISOString() });
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
  const userId = req.user.id;
  try {
    let orders = await knex('orders').where({ user_id: userId }).select();
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
  const userId = req.user.id;
  const { order_id } = req.params;
  try {
    const order = await knex('orders').where({ id: order_id, user_id: userId }).first();
    if (!order) return errorResponse(res, 404, '订单未找到或不属于当前用户');
    
    let orderItems = await knex('order_items').where({ order_id }).select();

    // Fetch details for all items in parallel for better performance
    const dishIds = orderItems.filter(item => item.dish_id).map(item => item.dish_id);
    const comboIds = orderItems.filter(item => item.combo_id).map(item => item.combo_id);

    const dishes = dishIds.length ? await knex('dishes').whereIn('id', dishIds) : [];
    const combos = comboIds.length ? await knex('combos').whereIn('id', comboIds) : [];

    orderItems = orderItems.map(item => {
        let productDetails = null;
        if (item.dish_id) {
            productDetails = dishes.find(d => d.id === item.dish_id);
        } else if (item.combo_id) {
            productDetails = combos.find(c => c.id === item.combo_id);
        }
        return { 
            ...item, 
            name: productDetails?.name || '商品信息缺失', 
            image_url: productDetails?.image_url || null 
        };
    });

    const shippingAddress = await knex('addresses').where({ id: order.address_id }).first();
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
const getAllOrders = async (req, res) => {
  const { status } = req.query;
  try {
    let query = knex('orders')
      .select(
        'orders.*',
        'users.username as customer_username',
        'addresses.recipient_name',
        'addresses.phone_number',
        'addresses.building_name',
        'addresses.room_details'
      )
      .join('users', 'orders.user_id', 'users.id')
      .leftJoin('addresses', 'orders.address_id', 'addresses.id');

    if (status && status !== 'all') {
      query.where('orders.status', status);
    }
    
    let orders = await query.orderBy('orders.created_at', 'desc');

    const orderIds = orders.map(o => o.id);
    const allOrderItems = await knex('order_items')
        .select(
            'order_items.*',
            knex.raw('COALESCE(dishes.name, combos.name) as name'),
            knex.raw('COALESCE(dishes.image_url, combos.image_url) as image_url')
        )
        .leftJoin('dishes', 'order_items.dish_id', 'dishes.id')
        .leftJoin('combos', 'order_items.combo_id', 'combos.id')
        .whereIn('order_items.order_id', orderIds);

    const ordersWithItems = orders.map(order => ({
      ...order,
      items: allOrderItems.filter(item => item.order_id === order.id)
    }));
    
    successResponse(res, ordersWithItems);
  } catch (error) {
    console.error('获取所有订单失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取所有订单失败');
  }
};

/**
 * @desc    更新订单状态 (管理员)
 * @route   PUT /api/orders/admin/:order_id
 * @body    { status }
 */
const updateOrderStatus = async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, 400, '无效的订单状态');
  }
  try {
    const updated = await knex('orders').where({ id: order_id }).update({ status, updated_at: new Date().toISOString() });
    if (updated === 0) return errorResponse(res, 404, '订单未找到');
    successResponse(res, { order_id, status }, '订单状态更新成功');
  } catch (error) {
    console.error('更新订单状态失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新订单状态失败');
  }
};

/**
 * @desc    删除订单 (管理员)
 * @route   DELETE /api/orders/admin/:order_id
 */
const deleteOrder = async (req, res) => {
  const { order_id } = req.params;
  try {
    const trx = await knex.transaction();
    try {
      // First, delete related order items
      await trx('order_items').where({ order_id }).del();
      // Then, delete the order itself
      const deleted = await trx('orders').where({ id: order_id }).del();
      
      if (deleted === 0) {
        await trx.rollback();
        return errorResponse(res, 404, '订单未找到');
      }

      await trx.commit();
      successResponse(res, null, '订单删除成功');
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('删除订单失败:', error.message);
    errorResponse(res, 500, '服务器错误: 删除订单失败');
  }
};

module.exports = {
  createOrder,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};