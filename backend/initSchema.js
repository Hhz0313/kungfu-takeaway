// 初始化数据库表结构
const knex = require('./utils/knex');

async function init() {
  // dishes 表
  const hasDishes = await knex.schema.hasTable('dishes');
  if (!hasDishes) {
    await knex.schema.createTable('dishes', (table) => {
      table.string('id').primary();
      table.string('category_id');
      table.string('canteen_id');
      table.string('name');
      table.string('description');
      table.float('price');
      table.string('image_url');
      table.string('flavors'); // JSON 字符串
      table.boolean('is_available').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('Created table: dishes');
  }

  // categories 表
  const hasCategories = await knex.schema.hasTable('categories');
  if (!hasCategories) {
    await knex.schema.createTable('categories', (table) => {
      table.string('id').primary();
      table.string('name');
      table.string('description');
      table.boolean('is_enabled').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('Created table: categories');
  }

  // canteens 表
  const hasCanteens = await knex.schema.hasTable('canteens');
  if (!hasCanteens) {
    await knex.schema.createTable('canteens', (table) => {
      table.string('id').primary();
      table.string('name');
      table.boolean('is_enabled').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('Created table: canteens');
  }

  // users 表
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.string('id').primary();
      table.string('username').unique();
      table.string('password');
      table.string('role').defaultTo('customer'); // customer, admin
      table.string('phone_number');
      table.string('email');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('Created table: users');
  }

  // combos 表
  const hasCombos = await knex.schema.hasTable('combos');
  if (!hasCombos) {
    await knex.schema.createTable('combos', (table) => {
      table.string('id').primary();
      table.string('name');
      table.string('description');
      table.float('price');
      table.string('image_url');
      table.boolean('is_enabled').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log('Created table: combos');
  }

  // combo_dishes 表（套餐与菜品关联）
  const hasComboDishes = await knex.schema.hasTable('combo_dishes');
  if (!hasComboDishes) {
    await knex.schema.createTable('combo_dishes', (table) => {
      table.increments('id').primary();
      table.string('combo_id');
      table.string('dish_id');
      table.integer('quantity').defaultTo(1);
      table.foreign('combo_id').references('id').inTable('combos').onDelete('CASCADE');
      table.foreign('dish_id').references('id').inTable('dishes').onDelete('CASCADE');
    });
    console.log('Created table: combo_dishes');
  }

  // addresses 表
  const hasAddresses = await knex.schema.hasTable('addresses');
  if (!hasAddresses) {
    await knex.schema.createTable('addresses', (table) => {
      table.string('id').primary();
      table.string('user_id');
      table.string('recipient_name');
      table.string('phone_number');
      table.string('building_name');
      table.string('room_details');
      table.boolean('is_default').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
    console.log('Created table: addresses');
  }

  // cart_items 表
  const hasCartItems = await knex.schema.hasTable('cart_items');
  if (!hasCartItems) {
    await knex.schema.createTable('cart_items', (table) => {
      table.string('id').primary();
      table.string('user_id');
      table.string('dish_id').nullable();
      table.string('combo_id').nullable();
      table.integer('quantity').defaultTo(1);
      table.string('selected_flavors').nullable(); // 存储选中的口味，JSON 字符串
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('dish_id').references('id').inTable('dishes').onDelete('CASCADE');
      table.foreign('combo_id').references('id').inTable('combos').onDelete('CASCADE');
    });
    console.log('Created table: cart_items');
  }

  // orders 表
  const hasOrders = await knex.schema.hasTable('orders');
  if (!hasOrders) {
    await knex.schema.createTable('orders', (table) => {
      table.string('id').primary();
      table.string('user_id');
      table.string('address_id');
      table.float('total_amount');
      table.string('status').defaultTo('pending'); // pending, paid, preparing, delivering, completed, cancelled
      table.string('payment_status').defaultTo('unpaid'); // unpaid, paid, refunded
      table.string('payment_method').nullable(); // cash, wechat, alipay
      table.string('remark').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.foreign('address_id').references('id').inTable('addresses').onDelete('CASCADE');
    });
    console.log('Created table: orders');
  }

  // order_items 表
  const hasOrderItems = await knex.schema.hasTable('order_items');
  if (!hasOrderItems) {
    await knex.schema.createTable('order_items', (table) => {
      table.string('id').primary();
      table.string('order_id');
      table.string('dish_id').nullable();
      table.string('combo_id').nullable();
      table.integer('quantity');
      table.float('price');
      table.string('selected_flavors').nullable(); // 存储选中的口味，JSON 字符串
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
      table.foreign('dish_id').references('id').inTable('dishes').onDelete('CASCADE');
      table.foreign('combo_id').references('id').inTable('combos').onDelete('CASCADE');
    });
    console.log('Created table: order_items');
  }

  await knex.destroy();
}

init().catch((err) => {
  console.error('初始化数据库失败:', err);
});
