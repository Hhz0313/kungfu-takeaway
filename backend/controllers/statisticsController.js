const { successResponse, errorResponse } = require('../utils/responseUtil');
const knex = require('../utils/knex');

/**
 * @desc    获取热销菜品排行 (按销量)
 * @route   GET /api/statistics/hot-dishes
 * @query   limit (optional) - 返回排行数量，默认10
 */
const getHotDishes = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const hotDishesData = await knex('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('dishes', 'order_items.dish_id', 'dishes.id')
      .where('orders.payment_status', 'paid')
      .select(
        'dishes.name as dish_name',
        'order_items.dish_id'
      )
      .sum('order_items.quantity as total_quantity_sold')
      .sum(knex.raw('order_items.quantity * order_items.price'), { as: 'total_revenue' })
      .groupBy('order_items.dish_id', 'dishes.name')
      .orderBy('total_quantity_sold', 'desc')
      .limit(limit);

    const hotDishes = hotDishesData.map(item => ({
      ...item,
      dish_name: item.dish_name,
      total_revenue: parseFloat(item.total_revenue || 0),
      total_quantity_sold: parseInt(item.total_quantity_sold, 10)
    }));

    successResponse(res, hotDishes);
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
  const limit = parseInt(req.query.limit, 10) || 10;
  try {
    const hotCombosData = await knex('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('combos', 'order_items.combo_id', 'combos.id')
      .where('orders.payment_status', 'paid')
      .select(
        'combos.name as combo_name',
        'order_items.combo_id'
      )
      .sum('order_items.quantity as total_quantity_sold')
      .sum(knex.raw('order_items.quantity * order_items.price'), { as: 'total_revenue' })
      .groupBy('order_items.combo_id', 'combos.name')
      .orderBy('total_quantity_sold', 'desc')
      .limit(limit);

    const hotCombos = hotCombosData.map(item => ({
      ...item,
      combo_name: item.combo_name,
      total_revenue: parseFloat(item.total_revenue || 0),
      total_quantity_sold: parseInt(item.total_quantity_sold, 10)
    }));
      
    successResponse(res, hotCombos);
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

    if (period !== 'custom') {
        const today = new Date();
        end_date = today.toISOString().slice(0, 10);
        const d = new Date(today);
        d.setDate(d.getDate() - 6);
        start_date = d.toISOString().slice(0, 10);
    }
    
    // 直接用 knex 查询，便于聚合
    let groupFormat, dbTimezone = 'UTC';
    
    // Note: SQLite strftime works with UTC by default. 
    // If server time is not UTC, this might lead to discrepancies for 'today's stats.
    // For simplicity, we assume UTC or server's consistent timezone.
    switch (period) {
      case 'weekly':
        groupFormat = knex.raw("strftime('%Y-W%W', created_at, 'weekday 1', '-3 days')"); // ISO 8601 week number
        break;
      case 'monthly':
        groupFormat = knex.raw("strftime('%Y-%m', created_at)");
        break;
      case 'yearly':
        groupFormat = knex.raw("strftime('%Y', created_at)");
        break;
      default: // daily or custom
        groupFormat = knex.raw("strftime('%Y-%m-%d', created_at)");
    }
    
    const query = knex('orders')
      .where('payment_status', 'paid')
      .select({ period: groupFormat })
      .sum({ total_turnover: 'total_amount' })
      .count({ order_count: '*' })
      .groupBy('period')
      .orderBy('period', 'asc');

    if (start_date && end_date) {
        query.andWhere('created_at', '>=', `${start_date} 00:00:00`)
             .andWhere('created_at', '<=', `${end_date} 23:59:59`);
    }

    const rows = await query;
    
    const result = rows.map(row => ({
      ...row,
      period_display: row.period,
      total_turnover: parseFloat(row.total_turnover || 0),
      order_count: Number(row.order_count || 0)
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
    // 今日日期
    const todayStr = new Date().toISOString().slice(0, 10);
    // 今日订单数/营业额
    const todayOrders = await knex('orders')
      .where('payment_status', 'paid')
      .andWhere('created_at', '>=', todayStr + ' 00:00:00')
      .andWhere('created_at', '<=', todayStr + ' 23:59:59')
      .first(knex.raw('count(*) as count'), knex.raw('sum(total_amount) as turnover'));
    // 待处理订单数（已支付但未完成/未取消）
    const pendingOrders = await knex('orders')
      .whereIn('status', ['paid', 'confirmed', 'preparing', 'delivering'])
      .where('payment_status', 'paid')
      .first(knex.raw('count(*) as count'));
    // 在售商品数（菜品+套餐）
    const dishCount = await knex('dishes').where('is_available', true).first(knex.raw('count(*) as count'));
    const comboCount = await knex('combos').where('is_enabled', true).first(knex.raw('count(*) as count'));
    
    const overview = {
      todays_orders_count: Number(todayOrders?.count || 0),
      todays_turnover: parseFloat(todayOrders?.turnover || 0),
      pending_orders_count: Number(pendingOrders?.count || 0),
      available_items_count: Number(dishCount?.count || 0) + Number(comboCount?.count || 0)
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