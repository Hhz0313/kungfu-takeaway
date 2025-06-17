const OpenAI = require('openai');
const knex = require('../utils/knex');
const { successResponse, errorResponse } = require('../utils/responseUtil');

// 配置 OpenAI SDK 以使用阿里云通义千问服务
const openai = new OpenAI({
  apiKey: 'sk-baa19711ae5b44f396d15d21a1db1f6c',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

/**
 * @desc    获取AI点餐推荐
 * @route   POST /api/ai/recommend
 */
const getRecommendation = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. 获取用户历史订单数据，并包含口味选择
    const userOrderHistory = await knex('orders')
      .where({ user_id: userId, payment_status: 'paid' })
      .orderBy('created_at', 'desc')
      .limit(10); // 获取最近10个订单以获得更准的口味分析

    let historicalItems = [];
    if (userOrderHistory.length > 0) {
      const orderIds = userOrderHistory.map(o => o.id);
      historicalItems = await knex('order_items')
        .select(
          knex.raw('COALESCE(d.name, c.name) as name'),
          'order_items.quantity',
          'order_items.selected_flavors' // 新增：获取口味信息
        )
        .leftJoin('dishes as d', 'order_items.dish_id', 'd.id')
        .leftJoin('combos as c', 'order_items.combo_id', 'c.id')
        .whereIn('order_items.order_id', orderIds)
        .andWhere(function() {
          this.whereNotNull('order_items.dish_id').orWhereNotNull('order_items.combo_id');
        });
    }

    // 2. 获取餐厅所有在售菜品、套餐和热销排行
    const availableDishes = await knex('dishes').where('is_available', true).select('name');
    const availableCombos = await knex('combos').where('is_enabled', true).select('name');
    
    const hotDishes = await knex('order_items')
      .join('dishes', 'order_items.dish_id', 'dishes.id')
      .select('dishes.name')
      .sum('order_items.quantity as total_quantity')
      .groupBy('dishes.name')
      .orderBy('total_quantity', 'desc')
      .limit(10);

    const hotCombos = await knex('order_items')
      .join('combos', 'order_items.combo_id', 'combos.id')
      .select('combos.name')
      .sum('order_items.quantity as total_quantity')
      .groupBy('combos.name')
      .orderBy('total_quantity', 'desc')
      .limit(5);

    // 3. 构建高质量的Prompt
    
    // 3.1 分析口味偏好
    const flavorCounts = {};
    historicalItems.forEach(item => {
      if (item.selected_flavors) {
        try {
          const flavors = JSON.parse(item.selected_flavors);
          flavors.forEach(flavor => {
            flavorCounts[flavor.name] = (flavorCounts[flavor.name] || 0) + 1;
          });
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    const topFlavors = Object.entries(flavorCounts)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name)
      .join(', ');

    // 3.2 分析点餐历史
    const userHistoryString = historicalItems.length > 0
      ? historicalItems.map(item => `${item.name} (x${item.quantity})`).join(', ')
      : '这位用户是第一次光临，还没有历史订单。';

    // 3.3 获取时间情景
    const currentHour = new Date().getHours();
    let timeContext = '现在是晚餐时间';
    if (currentHour >= 5 && currentHour < 10) timeContext = '现在是早餐时间';
    if (currentHour >= 10 && currentHour < 16) timeContext = '现在是午餐时间';

    // 3.4 准备菜单列表
    const availableDishesString = availableDishes.map(d => d.name).join(', ');
    const availableCombosString = availableCombos.map(c => c.name).join(', ');
    const hotDishesString = hotDishes.map(d => d.name).join(', ');
    const hotCombosString = hotCombos.map(c => c.name).join(', ');

    // 3.5 最终指令
    const prompt = `
      你是一位风趣幽默、精通美食的"功夫宅急送"校园外卖点餐助手。你的任务是根据用户的历史订单和口味偏好，结合当前的时间和餐厅的热销菜品，为用户提供一份高度个性化、有理有据且让人食欲大开的专属点餐建议。

      ## 核心情景与用户信息
      - **当前时间**: ${timeContext}。你的推荐需要与这个时间段匹配（例如，早上不推荐过于油腻的正餐）。
      - **用户口味画像**: 根据历史订单分析，用户偏好这些口味：**${topFlavors || '暂无明确口味偏好'}**。请在推荐时重点考虑。
      - **历史订单记录**: ${userHistoryString}

      ## 餐厅信息
      - **可选菜单 (你必须且只能从以下列表中选择推荐的商品)**
        - 所有在售菜品: ${availableDishesString}
        - 所有在售套餐: ${availableCombosString}
      - **热销榜单**
        - 热销菜品: ${hotDishesString}
        - 热销套餐: ${hotCombosString}

      ## 你的任务
      请你综合以上所有信息，完成以下两项任务，并严格按照指定的JSON格式返回结果。

      ### 任务1: 生成推荐文案
      直接以朋友般的亲切口吻对用户说话，生成一段推荐文案，包含以下部分：
      1.  **问候与分析**: 结合 **当前时间** 和 **用户口味画像** 进行亲切问候。例如："中午好呀！我发现你好像特别喜欢'不辣'和'少盐'的口味，是个养生小达人嘛！"
      2.  **个性化推荐**: 基于口味和时间，精心推荐1-2个具体菜品或套餐。解释推荐理由，并结合热销商品增加说服力。例如："既然你喜欢清淡，今天中午可以试试我们的热销菜品「香菇滑鸡饭」，完全符合你的口味，而且分量足，保证下午学习精力满满！"
      3.  **结尾**: 用一句俏皮话结尾，鼓励用户下单。

      ### 任务2: 提取推荐商品
      从你生成的推荐文案中，提取出你明确推荐的1-2个商品。

      ## 返回格式要求 (必须严格遵守)
      请返回一个单一的、无额外解释的JSON对象，结构如下:
      {
        "recommendationText": "这里是你的推荐文案内容...",
        "recommendedItems": [
          { "name": "商品1名称", "type": "dish" },
          { "name": "商品2名称", "type": "combo" }
        ]
      }
      - 'name' 必须与"可选菜单"中的名称完全一致。
      - 'type' 必须是 'dish' 或 'combo'。
      - 如果没有推荐任何商品，'recommendedItems'应为空数组 []。
    `;

    // 4. 调用通义千问模型API
    const chatCompletion = await openai.chat.completions.create({
        model: "qwen-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // 启用JSON输出模式
    });

    if (chatCompletion && chatCompletion.choices && chatCompletion.choices[0].message && chatCompletion.choices[0].message.content) {
        const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
        
        // 5. 验证AI返回的商品并获取ID
        const validatedItems = [];
        if (aiResponse.recommendedItems && aiResponse.recommendedItems.length > 0) {
            for (const item of aiResponse.recommendedItems) {
                let product;
                if (item.type === 'dish') {
                    product = await knex('dishes').where({ name: item.name, is_available: true }).first();
                } else if (item.type === 'combo') {
                    product = await knex('combos').where({ name: item.name, is_enabled: true }).first();
                }

                if (product) {
                    validatedItems.push({
                        id: product.id,
                        name: product.name,
                        type: item.type,
                    });
                }
            }
        }

        successResponse(res, { 
            recommendationText: aiResponse.recommendationText,
            actionableItems: validatedItems 
        });

    } else {
        console.error('AI recommendation failed, raw response:', chatCompletion);
        throw new Error('AI服务返回了无效的数据');
    }

  } catch (error) {
    console.error('获取AI推荐失败:', error.message, error.stack);
    errorResponse(res, 500, '服务器错误: 获取AI推荐失败', { details: error.message });
  }
};

module.exports = {
  getRecommendation,
}; 