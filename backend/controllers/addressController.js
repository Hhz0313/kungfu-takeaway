const { readData, writeData, generateId } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const ADDRESS_MODEL_NAME = 'addresses';
const USER_MODEL_NAME = 'users'; // Though users are not fully implemented, keep for consistency

// 模拟登录用户 (后续替换为真实认证)
const DUMMY_USER_ID = "1"; // Keep as string if IDs are strings, or number if numbers

/**
 * @desc    获取当前用户的所有收货地址
 * @route   GET /api/addresses
 */
const getAddresses = async (req, res) => {
  // const userId = req.user.id; // 实际从认证中获取
  const userId = DUMMY_USER_ID;
  try {
    const addresses = await readData(ADDRESS_MODEL_NAME);
    const userAddresses = addresses.filter(addr => addr.user_id === userId);
    // 按是否默认和更新时间排序
    userAddresses.sort((a, b) => {
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        return new Date(b.updated_at) - new Date(a.updated_at);
    });
    successResponse(res, userAddresses);
  } catch (error) {
    console.error('获取地址列表失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取地址列表失败');
  }
};

/**
 * @desc    根据ID获取单个收货地址
 * @route   GET /api/addresses/:id
 */
const getAddressById = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { id } = req.params;
  try {
    const addresses = await readData(ADDRESS_MODEL_NAME);
    const address = addresses.find(addr => addr.id === id && addr.user_id === userId);
    if (!address) {
      return errorResponse(res, 404, '地址未找到或不属于当前用户');
    }
    successResponse(res, address);
  } catch (error) {
    console.error('获取单个地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取单个地址失败');
  }
};

/**
 * @desc    创建新收货地址
 * @route   POST /api/addresses
 */
const createAddress = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { 
    recipient_name, 
    phone_number, 
    building_name,
    room_details,
    is_default = false 
  } = req.body;

  if (!recipient_name || !phone_number || !building_name || !room_details) {
    return errorResponse(res, '收件人姓名、电话、楼宇名称和房间详情为必填项', 400);
  }

  try {
    let addresses = await readData(ADDRESS_MODEL_NAME);
    const newAddressId = generateId();

    if (Boolean(is_default)) {
      // 如果设为默认，则将该用户其他地址的is_default设为false
      addresses = addresses.map(addr => {
        if (addr.user_id === userId) {
          return { ...addr, is_default: false, updated_at: new Date().toISOString() };
        }
        return addr;
      });
    }

    const newAddress = {
      id: newAddressId,
      user_id: userId,
      recipient_name,
      phone_number,
      building_name,
      room_details,
      is_default: Boolean(is_default),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addresses.push(newAddress);
    await writeData(ADDRESS_MODEL_NAME, addresses);
    successResponse(res, newAddress, '地址创建成功');
  } catch (error) {
    console.error('创建地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 创建地址失败');
  }
};

/**
 * @desc    更新收货地址
 * @route   PUT /api/addresses/:id
 */
const updateAddress = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { id } = req.params;
  const { 
    recipient_name, 
    phone_number, 
    building_name,
    room_details,
    is_default 
  } = req.body;

  try {
    let addresses = await readData(ADDRESS_MODEL_NAME);
    const addressIndex = addresses.findIndex(addr => addr.id === id && addr.user_id === userId);

    if (addressIndex === -1) {
      return errorResponse(res, 404, '地址未找到或不属于当前用户');
    }

    if (is_default !== undefined && Boolean(is_default)) {
      // 如果将此地址设为默认，则将该用户其他地址的is_default设为false
      addresses = addresses.map(addr => {
        if (addr.user_id === userId && addr.id !== id) {
          return { ...addr, is_default: false, updated_at: new Date().toISOString() };
        }
        return addr;
      });
    }
    
    const originalAddress = addresses[addressIndex];
    const updatedAddress = {
      ...originalAddress,
      recipient_name: recipient_name || originalAddress.recipient_name,
      phone_number: phone_number || originalAddress.phone_number,
      building_name: building_name || originalAddress.building_name,
      room_details: room_details || originalAddress.room_details,
      is_default: is_default !== undefined ? Boolean(is_default) : originalAddress.is_default,
      updated_at: new Date().toISOString(),
    };

    addresses[addressIndex] = updatedAddress;
    await writeData(ADDRESS_MODEL_NAME, addresses);
    successResponse(res, updatedAddress, '地址更新成功');
  } catch (error) {
    console.error('更新地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 更新地址失败');
  }
};

/**
 * @desc    删除收货地址
 * @route   DELETE /api/addresses/:id
 */
const deleteAddress = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { id } = req.params;

  try {
    let addresses = await readData(ADDRESS_MODEL_NAME);
    const addressIndex = addresses.findIndex(addr => addr.id === id && addr.user_id === userId);

    if (addressIndex === -1) {
      return errorResponse(res, 404, '地址未找到或不属于当前用户');
    }

    if (addresses[addressIndex].is_default) {
      return errorResponse(res, 400, '不能删除默认地址。请先设置其他地址为默认。');
    }

    addresses.splice(addressIndex, 1);
    await writeData(ADDRESS_MODEL_NAME, addresses);
    successResponse(res, null, '地址删除成功');
  } catch (error) {
    console.error('删除地址失败:', error.message);
    errorResponse(res, 500, '服务器错误: 删除地址失败');
  }
};

/**
 * @desc    设置默认收货地址
 * @route   PUT /api/addresses/:id/set-default
 */
const setDefaultAddress = async (req, res) => {
  const userId = DUMMY_USER_ID;
  const { id } = req.params;

  try {
    let addresses = await readData(ADDRESS_MODEL_NAME);
    const addressIndex = addresses.findIndex(addr => addr.id === id && addr.user_id === userId);

    if (addressIndex === -1) {
      return errorResponse(res, 404, '地址未找到或不属于当前用户');
    }

    addresses = addresses.map(addr => {
      if (addr.user_id === userId) {
        return { 
            ...addr, 
            is_default: addr.id === id, 
            updated_at: new Date().toISOString() 
        };
      }
      return addr;
    });

    await writeData(ADDRESS_MODEL_NAME, addresses);
    successResponse(res, addresses.find(addr => addr.id === id), '默认地址设置成功');
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