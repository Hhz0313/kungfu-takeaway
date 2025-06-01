const { readData } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const CANTEEN_MODEL_NAME = 'canteens';

/**
 * @desc    Get the list of all predefined canteens
 * @route   GET /api/config/canteens
 */
const getAvailableCanteens = async (req, res) => {
  try {
    const canteens = await readData(CANTEEN_MODEL_NAME);
    // Optionally filter by is_enabled if needed, or send all
    // For this simplified version, we send all as they are predefined.
    // The frontend can filter by is_enabled if it reads that property.
    successResponse(res, canteens);
  } catch (error) {
    console.error('获取食堂配置列表失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取食堂配置列表失败');
  }
};

module.exports = {
  getAvailableCanteens,
}; 