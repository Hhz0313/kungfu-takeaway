const knex = require('../utils/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  try {
    const user = await knex('users').where({ username }).first();

    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Use a different secret for admin tokens
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.ADMIN_JWT_SECRET || 'a-super-secret-key-for-admins',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '登录成功',
      token, // This will be the admin-token
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