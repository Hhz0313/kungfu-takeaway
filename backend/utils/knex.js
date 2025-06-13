// 配置并导出 Knex 实例，连接 SQLite 数据库
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: __dirname + '/../models/kungfu_takeaway.db',
  },
  useNullAsDefault: true,
});

module.exports = knex;
