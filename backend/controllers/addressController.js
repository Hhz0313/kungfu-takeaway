const knex = require('../utils/knex');
const { successResponse, errorResponse } = require('../utils/responseUtil');
const { v4: uuidv4 } = require('uuid');

// 获取当前用户的所有收货地址
const getAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    let addresses = await knex('addresses').where({ user_id: userId }).select();
    addresses.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
    successResponse(res, addresses);
  } catch (error) {
    console.error('获取地址列表失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取地址列表失败');
  }
};

// 获取单个地址
const getAddressById = async (req, res) => {
  const userId = req.user.id;
  const { address_id } = req.params;
  try {
    const address = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    if (!address) return errorResponse(res, 404, '地址未找到或不属于当前用户');
    successResponse(res, address);
  } catch (error) {
    console.error('获取单个地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取单个地址失败');
  }
};

// 创建新地址
const createAddress = async (req, res) => {
  const userId = req.user.id;
  const { recipient_name, phone_number, building_name, room_details, is_default = false } = req.body;
  if (!recipient_name || !phone_number || !building_name || !room_details) {
    return errorResponse(res, 400, '收件人姓名、电话、楼宇名称和房间详情为必填项');
  }
  try {
    if (is_default) {
      await knex('addresses').where({ user_id: userId }).update({ is_default: false });
    }
    const newAddress = {
      id: uuidv4(),
      user_id: userId,
      recipient_name,
      phone_number,
      building_name,
      room_details,
      is_default: Boolean(is_default),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await knex('addresses').insert(newAddress);
    successResponse(res, newAddress, '地址创建成功');
  } catch (error) {
    console.error('创建地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 创建地址失败');
  }
};

// 更新地址
const updateAddress = async (req, res) => {
  const userId = req.user.id;
  const { address_id } = req.params;
  const { recipient_name, phone_number, building_name, room_details, is_default } = req.body;
  try {
    const address = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    if (!address) return errorResponse(res, 404, '地址未找到或不属于当前用户');
    if (is_default !== undefined && Boolean(is_default)) {
      await knex('addresses').where({ user_id: userId }).update({ is_default: false });
    }
    const updates = {
      recipient_name: recipient_name || address.recipient_name,
      phone_number: phone_number || address.phone_number,
      building_name: building_name || address.building_name,
      room_details: room_details || address.room_details,
      is_default: is_default !== undefined ? Boolean(is_default) : address.is_default,
      updated_at: new Date().toISOString(),
    };
    await knex('addresses').where({ id: address_id, user_id: userId }).update(updates);
    const updated = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    successResponse(res, updated, '地址更新成功');
  } catch (error) {
    console.error('更新地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新地址失败');
  }
};

// 删除地址
const deleteAddress = async (req, res) => {
  const userId = req.user.id;
  const { address_id } = req.params;
  try {
    const address = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    if (!address) return errorResponse(res, 404, '地址未找到或不属于当前用户');
    if (address.is_default) return errorResponse(res, 400, '不能删除默认地址。请先设置其他地址为默认。');
    await knex('addresses').where({ id: address_id, user_id: userId }).del();
    successResponse(res, null, '地址删除成功');
  } catch (error) {
    console.error('删除地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 删除地址失败');
  }
};

// 设置为默认地址（兼容 /default 和 /set-default 路由）
const setDefaultAddress = async (req, res) => {
  const userId = req.user.id;
  // 兼容 /default 和 /set-default
  const address_id = req.params.address_id || req.params.id;
  try {
    const address = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    if (!address) return errorResponse(res, 404, '地址未找到或不属于当前用户');
    await knex('addresses').where({ user_id: userId }).update({ is_default: false });
    await knex('addresses').where({ id: address_id, user_id: userId }).update({ is_default: true, updated_at: new Date().toISOString() });
    const updated = await knex('addresses').where({ id: address_id, user_id: userId }).first();
    successResponse(res, updated, '默认地址设置成功');
  } catch (error) {
    console.error('设置默认地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 设置默认地址失败');
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};