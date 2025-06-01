const { readData } = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const ORDER_MODEL_NAME = 'orders';
const ORDER_ITEM_MODEL_NAME = 'orderItems';
const DISH_MODEL_NAME = 'dishes';
const COMBO_MODEL_NAME = 'combos';
const CATEGORY_MODEL_NAME = 'categories';

/**
 * @desc    获取热销菜品排行 (按销量)
 * @route   GET /api/statistics/hot-dishes
 * @query   limit (optional) - 返回排行数量，默认10
 */
const getHotDishes = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const orders = await readData(ORDER_MODEL_NAME);
    const paidOrders = orders.filter(o => o.payment_status === 'paid');
    const paidOrderIds = paidOrders.map(o => o.id);

    const orderItems = await readData(ORDER_ITEM_MODEL_NAME);
    const dishOrderItems = orderItems.filter(oi => paidOrderIds.includes(oi.order_id) && oi.item_type === 'dish');

    const dishes = await readData(DISH_MODEL_NAME);

    const dishSales = {}; // { dish_id: { name, total_quantity_sold, unit_price, total_revenue } }

    dishOrderItems.forEach(item => {
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
        const orders = await readData(ORDER_MODEL_NAME);
        const paidOrders = orders.filter(o => o.payment_status === 'paid');
        const paidOrderIds = paidOrders.map(o => o.id);

        const orderItems = await readData(ORDER_ITEM_MODEL_NAME);
        const comboOrderItems = orderItems.filter(oi => paidOrderIds.includes(oi.order_id) && oi.item_type === 'combo');

        const combos = await readData(COMBO_MODEL_NAME);
        const comboSales = {}; // { combo_id: { name, total_quantity_sold, unit_price, total_revenue } }

        comboOrderItems.forEach(item => {
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
 * @query   period (optional) - 统计周期 ('daily', 'weekly', 'monthly', 'yearly'), 默认 'daily'
 * @query   startDate (optional, YYYY-MM-DD) - 自定义开始日期
 * @query   endDate (optional, YYYY-MM-DD) - 自定义结束日期
 */
const getTurnoverStats = async (req, res) => {
  const { period = 'daily', startDate, endDate } = req.query;
  try {
    const orders = await readData(ORDER_MODEL_NAME);
    const paidOrders = orders.filter(o => o.payment_status === 'paid');

    let filteredOrders = paidOrders;
    let groupByFn = (dateStr) => dateStr.substring(0, 10); // Default to daily grouping (YYYY-MM-DD)

    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // Include end date

        filteredOrders = paidOrders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= start && orderDate < end;
        });

        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) +1;
        
        if (diffDays <= 1) { // Single day or same day range
            groupByFn = (dateStr) => `${new Date(dateStr).toISOString().substring(0, 10)} ${String(new Date(dateStr).getHours()).padStart(2, '0')}:00`; // Hourly
        } else if (diffDays <= 62) { // Approx 2 months, group by day
             groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 10);
        } else if (diffDays <= 365 * 2) { // Approx 2 years, group by month
            groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 7); // YYYY-MM
        } else { // Longer, group by year
            groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 4); // YYYY
        }

    } else {
      switch (period) {
        case 'daily':
          filteredOrders = paidOrders.filter(o => o.created_at.startsWith(todayStr));
          groupByFn = (dateStr) => `${new Date(dateStr).toISOString().substring(0, 10)} ${String(new Date(dateStr).getHours()).padStart(2, '0')}:00`; // Hourly for today
          break;
        case 'weekly':
          const firstDayOfWeek = new Date(today);
          firstDayOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as first day
          firstDayOfWeek.setHours(0,0,0,0);
          const lastDayOfWeek = new Date(firstDayOfWeek);
          lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);
          filteredOrders = paidOrders.filter(o => {
            const orderDate = new Date(o.created_at);
            return orderDate >= firstDayOfWeek && orderDate < lastDayOfWeek;
          });
          groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 10); // Daily for this week
          break;
        case 'monthly':
          const currentMonthStr = today.toISOString().substring(0, 7); // YYYY-MM
          filteredOrders = paidOrders.filter(o => o.created_at.startsWith(currentMonthStr));
          groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 10); // Daily for this month
          break;
        case 'yearly':
          const currentYearStr = today.toISOString().substring(0, 4); // YYYY
          filteredOrders = paidOrders.filter(o => o.created_at.startsWith(currentYearStr));
          groupByFn = (dateStr) => new Date(dateStr).toISOString().substring(0, 7); // Monthly for this year
          break;
        default: // Default to daily
          filteredOrders = paidOrders.filter(o => o.created_at.startsWith(todayStr));
          groupByFn = (dateStr) => `${new Date(dateStr).toISOString().substring(0, 10)} ${String(new Date(dateStr).getHours()).padStart(2, '0')}:00`;
      }
    }

    const turnoverStats = {};
    filteredOrders.forEach(order => {
      const groupKey = groupByFn(order.created_at);
      if (!turnoverStats[groupKey]) {
        turnoverStats[groupKey] = { period_group: groupKey, total_turnover: 0, total_orders: 0 };
      }
      turnoverStats[groupKey].total_turnover += parseFloat(order.total_amount);
      turnoverStats[groupKey].total_orders += 1;
    });

    const result = Object.values(turnoverStats).sort((a,b) => a.period_group.localeCompare(b.period_group));

    successResponse(res, result);
  } catch (error) {
    console.error('获取营业额统计失败:', error.message);
    errorResponse(res, 500, '服务器错误: 获取营业额统计失败');
  }
};

/**
 * @desc    获取基础数据统计概览 (例如：今日订单数，今日营业额，待处理订单)
 * @route   GET /api/statistics/overview
 */
const getStatsOverview = async (req, res) => {
    try {
        const orders = await readData(ORDER_MODEL_NAME);
        const dishes = await readData(DISH_MODEL_NAME);
        const categories = await readData(CATEGORY_MODEL_NAME);

        const todayStr = new Date().toISOString().substring(0, 10);

        const todayPaidOrders = orders.filter(o => o.payment_status === 'paid' && o.created_at.startsWith(todayStr));
        const todayTurnover = todayPaidOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        
        const todayOrdersCount = orders.filter(o => o.created_at.startsWith(todayStr)).length;
        
        const pendingStatuses = ['pending', 'confirmed', 'preparing'];
        const pendingOrdersCount = orders.filter(o => o.payment_status === 'paid' && pendingStatuses.includes(o.status)).length;
        
        const availableDishesCount = dishes.filter(d => d.is_available).length;
        const enabledCategoriesCount = categories.filter(c => c.is_enabled).length;

        const overview = {
            today_turnover: parseFloat(todayTurnover.toFixed(2)),
            today_orders_count: todayOrdersCount,
            pending_orders_count: pendingOrdersCount,
            available_dishes_count: availableDishesCount,
            enabled_categories_count: enabledCategoriesCount,
        };

        successResponse(res, overview);
    } catch (error) {
        console.error('获取统计概览失败:', error.message);
        errorResponse(res, 500, '服务器错误: 获取统计概览失败');
    }
};


module.exports = {
  getHotDishes,
  getHotCombos,
  getTurnoverStats,
  getStatsOverview
}; 