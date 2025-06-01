const express = require('express');
const router = express.Router();
const {
  getHotDishes,
  getHotCombos,
  getTurnoverStats,
  getStatsOverview
} = require('../controllers/statisticsController');

// (实际项目中，这些路由应该有管理员权限验证中间件)

// 获取热销菜品排行
router.get('/hot-dishes', getHotDishes);

// 获取热销套餐排行
router.get('/hot-combos', getHotCombos);

// 获取营业额统计 (可按周期或自定义日期范围)
router.get('/turnover', getTurnoverStats);

// 获取后台统计总览数据
router.get('/overview', getStatsOverview);

module.exports = router; 