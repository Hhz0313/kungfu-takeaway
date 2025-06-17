const express = require('express');
const router = express.Router();
const {
  createOrder,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  getOrderHistory,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const authUser = require('../middleware/authUser');
const authAdmin = require('../middleware/authAdmin');

// --- 顾客端路由 ---
// 创建新订单 (需要认证)
router.post('/', authUser, createOrder);

// 模拟支付接口 - 支付成功 (需要认证)
router.post('/:order_id/pay/success', authUser, simulatePaymentSuccess);

// 模拟支付失败 (需要认证)
router.post('/:order_id/pay/failure', authUser, simulatePaymentFailure);

// 获取当前用户的订单历史 (需要认证)
router.get('/history', authUser, getOrderHistory);

// 获取特定订单的详情 (顾客视角) (需要认证)
router.get('/:order_id', authUser, getOrderDetails);


// --- 管理员/员工端路由 ---
// (实际项目中，这些路由应该有管理员权限验证中间件)

// 获取所有订单 (可按状态筛选)
router.get('/admin/all', authAdmin, getAllOrders);

// 更新订单状态 (例如：已接单、派送中、已完成、已取消)
router.put('/admin/:order_id', authAdmin, updateOrderStatus);

// 删除订单
router.delete('/admin/:order_id', authAdmin, deleteOrder);

module.exports = router; 