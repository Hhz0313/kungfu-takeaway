const express = require('express');
const router = express.Router();
const {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/addressController');

// 模拟用户认证 - 所有地址操作都针对 DUMMY_USER_ID

// 获取用户的所有地址
router.get('/', getAddresses);

// 获取特定ID的地址
router.get('/:address_id', getAddressById);

// 为用户创建新地址
router.post('/', createAddress);

// 更新用户地址
router.put('/:address_id', updateAddress);

// 删除用户地址
router.delete('/:address_id', deleteAddress);

// 设置为默认地址
router.patch('/:address_id/default', setDefaultAddress); // 兼容前端 /default
router.patch('/:address_id/set-default', setDefaultAddress);

module.exports = router;