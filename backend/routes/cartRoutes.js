const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authUser = require('../middleware/authUser');

// 所有购物车路由都需要用户认证
router.use(authUser);

// 获取购物车
router.get('/', cartController.getCart);

// 添加商品到购物车
router.post('/', cartController.addItemToCart);

// 更新购物车商品数量 (注意: 前端尚未完全实现此功能)
router.put('/items/:cart_item_id', cartController.updateCartItem);

// 清空整个购物车 (必须在 /items/:cartItemId 之前，防止 'clear' 被当作 id)
router.delete('/clear', cartController.clearCart);

// 从购物车删除单个商品
router.delete('/items/:cart_item_id', cartController.removeCartItem);

module.exports = router;