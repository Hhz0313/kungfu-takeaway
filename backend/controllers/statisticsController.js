const { successResponse, errorResponse } = require('../utils/responseUtil');
const db = require('../utils/db');

/**
 * @desc    获取热销菜品排行 (按销量)
 * @route   GET /api/statistics/hot-dishes
 * @query   limit (optional) - 返回排行数量，默认10
 */
const getHotDishes = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const orders = await db.getAllOrders({ payment_status: 'paid' });
    const paidOrderIds = orders.map(o => o.id);
    const orderItems = await db.getAllOrderItems({ item_type: 'dish', order_ids: paidOrderIds });
    const dishes = await db.getAllDishes();
    const dishSales = {};
    orderItems.forEach(item => {
      const dishInfo = dishes.find(d => d.id === item.item_id);
      if (dishInfo) {
        if (!dishSales[item.item_id]) {
          dishSales[item.item_id] = {
            item_id: item.item_id,
            dish_name: dishInfo.name,
            total_quantity_sold: 0,
            unit_price: parseFloat(dishInfo.price),
            total_revenue: 0,
          };
        }
        dishSales[item.item_id].total_quantity_sold += item.quantity;
        dishSales[item.item_id].total_revenue += parseFloat(item.sub_total);
      }
    });
    const sortedHotDishes = Object.values(dishSales)
      .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
      .slice(0, limit);
    successResponse(res, sortedHotDishes);
  } catch (error) {
    console.error('获取热销菜品排行失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取热销菜品排行失败');
  }
};

/**
 * @desc    获取热销套餐排行 (按销量)
 * @route   GET /api/statistics/hot-combos
 * @query   limit (optional) - 返回排行数量，默认10
 */
const getHotCombos = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const orders = await db.getAllOrders({ payment_status: 'paid' });
    const paidOrderIds = orders.map(o => o.id);
    const orderItems = await db.getAllOrderItems({ item_type: 'combo', order_ids: paidOrderIds });
    const combos = await db.getAllCombos();
    const comboSales = {};
    orderItems.forEach(item => {
      const comboInfo = combos.find(c => c.id === item.item_id);
      if (comboInfo) {
        if (!comboSales[item.item_id]) {
          comboSales[item.item_id] = {
            item_id: item.item_id,
            combo_name: comboInfo.name,
            total_quantity_sold: 0,
            unit_price: parseFloat(comboInfo.price),
            total_revenue: 0,
          };
        }
        comboSales[item.item_id].total_quantity_sold += item.quantity;
        comboSales[item.item_id].total_revenue += parseFloat(item.sub_total);
      }
    });
    const sortedHotCombos = Object.values(comboSales)
      .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
      .slice(0, limit);
    successResponse(res, sortedHotCombos);
  } catch (error) {
    console.error('获取热销套餐排行失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取热销套餐排行失败');
  }
};

/**
 * @desc    获取营业额统计
 * @route   GET /api/statistics/turnover
 * @query   period (optional) - 统计周期 ('daily', 'weekly', 'monthly', 'yearly', 'custom')，默认 'daily'
 * @query   startDate (optional, YYYY-MM-DD) - 自定义开始日期
 * @query   endDate (optional, YYYY-MM-DD) - 自定义结束日期
 */
const getTurnoverStats = async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    let { start_date, end_date } = req.query;
    // 默认查询最近7天
    const today = new Date();
    if (!start_date) {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      start_date = d.toISOString().slice(0, 10);
    }
    if (!end_date) {
      end_date = today.toISOString().slice(0, 10);
    }
    // 查询已支付订单
    let ordersQuery = db.getAllOrders({ payment_status: 'paid' });
    // 直接用 knex 查询，便于聚合
    const knex = require('../utils/knex');
    let groupFormat, displayFormat;
    switch (period) {
      case 'weekly':
        groupFormat = knex.raw("strftime('%Y-%W', created_at)");
        displayFormat = 'YYYY-ww';
        break;
      case 'monthly':
        groupFormat = knex.raw("strftime('%Y-%m', created_at)");
        displayFormat = 'YYYY-MM';
        break;
      case 'yearly':
        groupFormat = knex.raw("strftime('%Y', created_at)");
        displayFormat = 'YYYY';
        break;
      default:
        groupFormat = knex.raw("strftime('%Y-%m-%d', created_at)");
        displayFormat = 'YYYY-MM-DD';
    }
    // 过滤日期
    const rows = await knex('orders')
      .where('payment_status', 'paid')
      .andWhere('created_at', '>=', start_date + ' 00:00:00')
      .andWhere('created_at', '<=', end_date + ' 23:59:59')
      .select({ period: groupFormat })
      .sum({ total_turnover: 'total_amount' })
      .count({ order_count: '*' })
      .groupBy('period')
      .orderBy('period', 'asc');
    // 格式化 period_display
    const result = rows.map(row => ({
      ...row,
      period_display: row.period,
      total_turnover: parseFloat(row.total_turnover),
      order_count: row.order_count
    }));
    return successResponse(res, result);
  } catch (error) {
    console.error('获取营业额统计失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取营业额统计失败');
  }
};

/**
 * @desc    获取基础数据统计概览 (如：今日订单数、今日营业额、待处理订单、在售商品数)
 * @route   GET /api/statistics/overview
 */
const getStatsOverview = async (req, res) => {
  try {
    const knex = require('../utils/knex');
    // 今日日期
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    // 今日订单数/营业额
    const todayOrders = await knex('orders')
      .where('payment_status', 'paid')
      .andWhere('created_at', '>=', todayStr + ' 00:00:00')
      .andWhere('created_at', '<=', todayStr + ' 23:59:59')
      .select(knex.raw('count(*) as count'), knex.raw('sum(total_amount) as turnover'));
    // 待处理订单数（未完成/未取消）
    const pendingOrders = await knex('orders')
      .whereIn('status', ['pending', 'confirmed', 'preparing', 'delivering'])
      .andWhere('payment_status', 'paid')
      .count({ count: '*' });
    // 在售商品数（菜品+套餐）
    const dishCount = await knex('dishes').where('is_available', 1).count({ count: '*' });
    const comboCount = await knex('combos').where('is_enabled', 1).count({ count: '*' });
    const overview = {
      todays_orders_count: Number(todayOrders[0]?.count || 0),
      todays_turnover: Number(todayOrders[0]?.turnover || 0),
      pending_orders_count: Number(pendingOrders[0]?.count || 0),
      available_items_count: Number(dishCount[0]?.count || 0) + Number(comboCount[0]?.count || 0)
    };
    return successResponse(res, overview);
  } catch (error) {
    console.error('获取统计概览失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取统计概览失败');
  }
};

module.exports = {
  getHotDishes,
  getHotCombos,
  getTurnoverStats,
  getStatsOverview
};