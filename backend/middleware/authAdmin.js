const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 从 header 获取 token
  const token = req.header('Authorization');

  // 检查 token 是否存在
  if (!token) {
    return res.status(401).json({ message: '认证失败，没有提供 token' });
  }

  // token 格式通常是 'Bearer TOKEN'
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token 格式不正确，应为 "Bearer [token]"' });
  }

  const actualToken = tokenParts[1];

  try {
    // 验证 token
    const decoded = jwt.verify(actualToken, process.env.ADMIN_JWT_SECRET || 'a-super-secret-key-for-admins');

    // 检查角色
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: '没有权限' });
    }
    
    // 将解码后的用户信息（payload）附加到请求对象上
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token 无效' });
  }
}; 