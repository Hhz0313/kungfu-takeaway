// scripts/createAdmin.js
const knex = require('./utils/knex');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAdmin() {
  try {
    const username = 'admin';
    const password = '123';

    // 检查管理员是否已存在
    const existingAdmin = await knex('users').where({ username }).first();
    if (existingAdmin) {
      console.log('管理员账户 "admin" 已存在。');
      return;
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新管理员用户
    const adminUser = {
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: 'admin', // 设置角色为 admin
      is_active: true,
    };

    await knex('users').insert(adminUser);
    console.log('成功创建管理员账户:');
    console.log(`  用户名: ${username}`);
    console.log(`  密码: ${password}`);

  } catch (error) {
    console.error('创建管理员账户失败:', error);
  } finally {
    // 关闭数据库连接
    await knex.destroy();
  }
}

createAdmin(); 