const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authUser = require('../middleware/authUser');

// --- Public Routes ---
// 用户注册
router.post('/register', userController.registerUser);

// 用户登录
router.post('/login', userController.loginUser);

// --- Protected Routes ---
// 获取当前用户信息
router.get('/profile', authUser, userController.getUserProfile);

// 更新用户信息
router.put('/profile', authUser, userController.updateUserProfile);

// 修改密码
router.put('/password', authUser, userController.changePassword);

// 充值
router.post('/recharge', authUser, userController.rechargeWallet);

module.exports = router; 