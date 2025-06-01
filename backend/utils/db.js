const fs = require('fs').promises; // Use promise-based fs for async operations
const path = require('path');

const modelsDir = path.resolve(__dirname, '../models');

// 数据文件名映射
const DATA_FILES = {
  categories: path.join(modelsDir, 'categories.json'),
  dishes: path.join(modelsDir, 'dishes.json'),
  combos: path.join(modelsDir, 'combos.json'),
  comboDishes: path.join(modelsDir, 'combo_dishes.json'), // 用于套餐和菜品的关联
  users: path.join(modelsDir, 'users.json'),
  addresses: path.join(modelsDir, 'addresses.json'),
  orders: path.join(modelsDir, 'orders.json'),
  orderItems: path.join(modelsDir, 'order_items.json'),
  cartItems: path.join(modelsDir, 'cart_items.json'),
  canteens: path.join(modelsDir, 'canteens.json'), // Added canteens
};

/**
 * @desc 确保数据目录和必要的JSON文件存在，如果不存在则创建空数组文件
 */
const initializeDataFiles = async () => {
  try {
    await fs.mkdir(modelsDir, { recursive: true });
    for (const key in DATA_FILES) {
      try {
        await fs.access(DATA_FILES[key]);
      } catch (error) { // 文件不存在，创建它
        // For canteens, initialize with predefined values
        if (key === 'canteens') {
          const predefinedCanteens = [
            { id: '1', name: '学子楼', is_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', name: '学士楼', is_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', name: '学苑楼', is_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '4', name: '紫丁香餐厅', is_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '5', name: '回味斋', is_enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ];
          await fs.writeFile(DATA_FILES[key], JSON.stringify(predefinedCanteens, null, 2), 'utf8');
          console.log(`Created and initialized data file: ${DATA_FILES[key]}`);
        } else {
          await fs.writeFile(DATA_FILES[key], JSON.stringify([]), 'utf8');
          console.log(`Created data file: ${DATA_FILES[key]}`);
        }
      }
    }
    // 也可以在这里初始化一些默认数据，例如管理员用户等
    // await seedInitialData(); 
  } catch (error) {
    console.error('Error initializing data files:', error);
    // 如果初始化失败，可能需要抛出错误或退出应用
    process.exit(1);
  }
};

/**
 * @desc 从指定的JSON文件读取数据
 * @param {string} modelName - 模型名称 (例如 'categories', 'dishes')
 * @returns {Promise<Array>}
 */
const readData = async (modelName) => {
  const filePath = DATA_FILES[modelName];
  if (!filePath) {
    throw new Error(`Invalid model name: ${modelName}`);
  }
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    // 如果文件不存在或读取错误，但我们期望它应该在initialize后存在，则返回空数组
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify([]), 'utf8'); // 创建空文件
      return [];
    }
    console.error(`Error reading data from ${filePath}:`, error);
    throw error; // 或者返回一个特定的错误响应
  }
};

/**
 * @desc 将数据写入指定的JSON文件
 * @param {string} modelName - 模型名称
 * @param {Array} data - 要写入的数据数组
 */
const writeData = async (modelName, data) => {
  const filePath = DATA_FILES[modelName];
  if (!filePath) {
    throw new Error(`Invalid model name: ${modelName}`);
  }
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8'); // null, 2 for pretty printing
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw error;
  }
};

/**
 * @desc 生成一个唯一的ID (简单实现，对于高并发场景可能需要更健壮的方案)
 */
const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// 启动时确保文件存在
// initializeDataFiles(); // 此调用将移至 app.js 中，以确保在应用启动时执行

module.exports = {
  readData,
  writeData,
  generateId,
  initializeDataFiles,
  DATA_FILES // 导出DATA_FILES方便其他模块直接引用路径
}; 