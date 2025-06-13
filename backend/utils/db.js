const knex = require('./knex');

// 用于生成唯一ID
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// dishes 数据库操作
const getAllDishes = (filter = {}) => {
  let query = knex('dishes');
  if (filter.category_id) query = query.where('category_id', filter.category_id);
  if (filter.canteen_id) query = query.where('canteen_id', filter.canteen_id);
  if (filter.is_available !== undefined) query = query.where('is_available', filter.is_available);
  return query.select();
};

const getDishById = (id) => {
  return knex('dishes').where({ id }).first();
};

const createDish = (dish) => {
  return knex('dishes').insert(dish);
};

const updateDish = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('dishes').where({ id }).update(updates);
};

const deleteDish = (id) => {
  return knex('dishes').where({ id }).delete();
};

// categories 数据库操作
const getAllCategories = (filter = {}) => {
  let query = knex('categories');
  if (filter.is_enabled !== undefined) query = query.where('is_enabled', filter.is_enabled);
  return query.select();
};

const getCategoryById = (id) => knex('categories').where({ id }).first();
const createCategory = (category) => knex('categories').insert(category);
const updateCategory = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('categories').where({ id }).update(updates);
};
const deleteCategory = (id) => knex('categories').where({ id }).delete();

// canteens 数据库操作
const getAllCanteens = (filter = {}) => {
  let query = knex('canteens');
  if (filter.is_enabled !== undefined) query = query.where('is_enabled', filter.is_enabled);
  return query.select();
};

const getCanteenById = (id) => knex('canteens').where({ id }).first();
const createCanteen = (canteen) => knex('canteens').insert(canteen);
const updateCanteen = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('canteens').where({ id }).update(updates);
};
const deleteCanteen = (id) => knex('canteens').where({ id }).delete();

// combos 数据库操作
const getAllCombos = (filter = {}) => {
  let query = knex('combos');
  if (filter.is_enabled !== undefined) query = query.where('is_enabled', filter.is_enabled);
  return query.select();
};

const getComboById = (id) => knex('combos').where({ id }).first();
const createCombo = (combo) => knex('combos').insert(combo);
const updateCombo = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('combos').where({ id }).update(updates);
};
const deleteCombo = (id) => knex('combos').where({ id }).delete();

// combo_dishes 数据库操作
const getComboDishes = (comboId) => {
  let query = knex('combo_dishes');
  if (comboId) {
    query = query.where({ combo_id: comboId });
  }
  return query.select();
};

const addComboDish = (comboId, dishId, quantity) => knex('combo_dishes').insert({
  combo_id: comboId,
  dish_id: dishId,
  quantity: quantity
});
const removeComboDish = (comboId) => knex('combo_dishes').where({ combo_id: comboId }).delete();

// addresses 数据库操作
const getAllAddresses = (filter = {}) => {
  let query = knex('addresses');
  if (filter.user_id) query = query.where('user_id', filter.user_id);
  return query.select();
};

const getAddressById = (id) => knex('addresses').where({ id }).first();
const createAddress = (address) => knex('addresses').insert(address);
const updateAddress = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('addresses').where({ id }).update(updates);
};
const deleteAddress = (id) => knex('addresses').where({ id }).delete();

// cart_items 数据库操作
const getCartItems = (userId) => {
  console.log('[db] getCartItems: Starting with userId:', userId);
  const query = knex('cart_items')
    .leftJoin('dishes', 'cart_items.dish_id', 'dishes.id')
    .leftJoin('combos', 'cart_items.combo_id', 'combos.id')
    .where('cart_items.user_id', userId)
    .select(
      'cart_items.*',
      'dishes.name as dish_name',
      'dishes.price as dish_price',
      'dishes.image_url as dish_image',
      'combos.name as combo_name',
      'combos.price as combo_price',
      'combos.image_url as combo_image'
    );
  
  console.log('[db] getCartItems: Generated SQL query:', query.toString());
  return query;
};

const addCartItem = (item) => {
  return knex('cart_items').insert({
    ...item,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
};

const updateCartItem = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('cart_items').where({ id }).update(updates);
};

const deleteCartItem = (id) => {
  return knex('cart_items').where({ id }).delete();
};

const clearCart = (userId) => {
  return knex('cart_items').where({ user_id: userId }).delete();
};

// orders 数据库操作
const getAllOrders = (filter = {}) => {
  let query = knex('orders');
  if (filter.user_id) query = query.where('user_id', filter.user_id);
  if (filter.status) query = query.where('status', filter.status);
  return query.select();
};

const getOrderById = (id) => knex('orders').where({ id }).first();
const createOrder = (order) => knex('orders').insert(order);
const updateOrder = (id, updates) => {
  updates.updated_at = new Date().toISOString();
  return knex('orders').where({ id }).update(updates);
};

// order_items 数据库操作
const getAllOrderItems = (orderId) => {
  return knex('order_items')
    .leftJoin('dishes', 'order_items.dish_id', 'dishes.id')
    .leftJoin('combos', 'order_items.combo_id', 'combos.id')
    .where('order_items.order_id', orderId)
    .select(
      'order_items.*',
      'dishes.name as dish_name',
      'combos.name as combo_name'
    );
};

const createOrderItem = (item) => knex('order_items').insert(item);

module.exports = {
  generateId,
  getAllDishes,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCanteens,
  getCanteenById,
  createCanteen,
  updateCanteen,
  deleteCanteen,
  getAllCombos,
  getComboById,
  createCombo,
  updateCombo,
  deleteCombo,
  getComboDishes,
  addComboDish,
  removeComboDish,
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCart,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getAllOrderItems,
  createOrderItem
};