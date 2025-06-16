const knex = require('../utils/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// 注册
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  try {
    const existingUser = await knex('users').where({ username }).first();
    if (existingUser) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: 'customer', // 默认注册为普通用户
    };

    await knex('users').insert(newUser);
    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 登录
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  try {
    const user = await knex('users').where({ username }).first();
    if (!user || user.role !== 'customer') {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.USER_JWT_SECRET || 'a-secret-key-for-users',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 获取当前用户信息
exports.getUserProfile = async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).select('id', 'username', 'role', 'email', 'phone_number', 'gender', 'birth_date', 'bio', 'food_tags', 'balance').first();
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 更新用户信息
exports.updateUserProfile = async (req, res) => {
  const { email, phone_number, gender, birth_date, bio, food_tags } = req.body;
  
  try {
    await knex('users')
      .where({ id: req.user.id })
      .update({
        email,
        phone_number,
        gender,
        birth_date,
        bio,
        food_tags,
        updated_at: knex.fn.now()
      });
    
    const updatedUser = await knex('users').where({ id: req.user.id }).select('id', 'username', 'role', 'email', 'phone_number', 'gender', 'birth_date', 'bio', 'food_tags', 'balance').first();
    res.status(200).json({ message: '用户信息更新成功', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '旧密码和新密码不能为空' });
  }

  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: '旧密码错误' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await knex('users')
      .where({ id: req.user.id })
      .update({ password: hashedNewPassword, updated_at: knex.fn.now() });

    res.status(200).json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};

// 充值
exports.rechargeWallet = async (req, res) => {
  const { amount } = req.body;
  const rechargeAmount = parseFloat(amount);

  if (!rechargeAmount || rechargeAmount <= 0) {
    return res.status(400).json({ message: '充值金额必须为正数' });
  }

  try {
    // 使用 Knex 的 increment 方法来安全地增加余额
    await knex('users')
      .where({ id: req.user.id })
      .increment('balance', rechargeAmount);

    const updatedUser = await knex('users').where({ id: req.user.id }).select('id', 'balance').first();

    res.status(200).json({ message: '充值成功', newBalance: updatedUser.balance });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error });
  }
};