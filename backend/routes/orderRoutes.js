const express = require('express');
const router = express.Router();
const {
  createOrder,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getOrderHistory,
  getOrderDetails,
  getAllOrdersAdmin,
  updateOrderStatusAdmin
} = require('../controllers/orderController');

// --- 顾客端路由 ---
// 创建新订单
router.post('/', createOrder);

// 模拟支付成功
router.post('/:order_id/pay/success', simulatePaymentSuccess);

// 模拟支付失败
router.post('/:order_id/pay/failure', simulatePaymentFailure);

// 获取当前用户的订单历史
router.get('/history', getOrderHistory);

// 获取特定订单的详情 (顾客视角)
router.get('/:order_id', getOrderDetails);


// --- 管理员/员工端路由 ---
// (实际项目中，这些路由应该有管理员权限验证中间件)

// 获取所有订单 (可按状态筛选)
router.get('/admin/all', getAllOrdersAdmin);

// 更新订单状态 (例如：已接单、派送中、已完成、已取消)
router.put('/admin/:order_id/status', updateOrderStatusAdmin);

module.exports = router; 