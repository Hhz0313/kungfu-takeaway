const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');

// 所有购物车路由都需要用户认证 (当前为模拟用户)

// 获取用户的购物车
router.get('/', getCart);

// 添加商品到购物车
router.post('/', addItemToCart);

// 更新购物车中的特定商品项 (例如：数量, 口味)
router.put('/:cart_item_id', updateCartItem);

// 从购物车移除特定商品项
router.delete('/:cart_item_id', removeCartItem);

// 清空用户的购物车
router.delete('/', clearCart);

module.exports = router; 