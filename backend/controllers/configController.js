const { successResponse, errorResponse } = require('../utils/responseUtil');

// 固定五个食堂，写死返回
const FIXED_CANTEENS = [
  { id: '1', name: '学子楼', is_enabled: true },
  { id: '2', name: '学士楼', is_enabled: true },
  { id: '3', name: '学苑楼', is_enabled: true },
  { id: '4', name: '紫丁香餐厅', is_enabled: true },
  { id: '5', name: '回味斋', is_enabled: true },
];

/**
 * @desc 获取所有食堂配置（写死五个）
 * @route GET /api/config/canteens
 */
const getAvailableCanteens = async (req, res) => {
  try {
    successResponse(res, FIXED_CANTEENS);
  } catch (error) {
    errorResponse(res, 500, '服务器错误: 获取食堂配置列表失败');
  }
};

module.exports = {
  getAvailableCanteens,
  FIXED_CANTEENS // 导出写死的五个食堂
};