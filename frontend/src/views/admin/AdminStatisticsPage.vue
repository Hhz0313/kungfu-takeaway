<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-8 text-slate-700">数据统计</h1>

    <!-- Messages -->
    <div v-if="isLoading && !overviewStats" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="ml-3 text-lg font-medium text-slate-600">加载统计数据中...</p>
    </div>
    <div v-if="errorMessage && !isLoading" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
      <div class="flex">
        <div class="py-1"><svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.97a1 1 0 012 0v5.06a1 1 0 11-2 0zm0 3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
        <div>
          <p class="font-bold">加载数据出错!</p>
          <p class="text-sm">{{ errorMessage }}</p>
        </div>
        <button @click="errorMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex h-8 w-8" aria-label="Close">
          <span class="sr-only">Dismiss</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <!-- Overview Stats -->
    <section v-if="overviewStats && !isLoading" class="mb-10">
      <h2 class="text-xl font-semibold mb-4 text-slate-600">关键指标 (今日)</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600">
          <div class="stat-icon-wrapper bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="stat-title">今日营业额</h3>
          <p class="stat-value">¥{{ overviewStats.todays_turnover?.toFixed(2) || '0.00' }}</p>
        </div>
        <div class="stat-card bg-gradient-to-br from-green-500 to-green-600">
           <div class="stat-icon-wrapper bg-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h3 class="stat-title">今日订单数</h3>
          <p class="stat-value">{{ overviewStats.todays_orders_count || 0 }}</p>
        </div>
        <div class="stat-card bg-gradient-to-br from-yellow-500 to-yellow-600">
          <div class="stat-icon-wrapper bg-yellow-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 class="stat-title">待处理订单</h3>
          <p class="stat-value">{{ overviewStats.pending_orders_count || 0 }}</p>
        </div>
        <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600">
           <div class="stat-icon-wrapper bg-purple-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </div>
          <h3 class="stat-title">在售项目数</h3>
          <p class="stat-value">{{ overviewStats.available_items_count || 0 }}</p>
          <p class="text-xs opacity-70">(菜品+套餐)</p>
        </div>
      </div>
    </section>

    <!-- Turnover Stats -->
    <section v-if="!isLoading" class="mb-10 bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-slate-600">营业额趋势</h2>
        <div class="flex flex-wrap gap-4 mb-4 items-center border-b border-slate-200 pb-4">
            <div>
                <label for="turnoverPeriod" class="label-form">统计周期:</label>
                <select v-model="turnoverParams.period" @change="fetchTurnoverStats" class="select-field">
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="custom">自定义日期范围</option>
                </select>
            </div>
            <div v-if="turnoverParams.period === 'custom'" class="flex flex-wrap gap-4 items-center">
                <div>
                    <label for="startDate" class="label-form">开始日期:</label>
                    <input type="date" v-model="turnoverParams.startDate" class="input-field-sm">
                </div>
                <div>
                    <label for="endDate" class="label-form">结束日期:</label>
                    <input type="date" v-model="turnoverParams.endDate" class="input-field-sm">
                </div>
                 <button @click="fetchTurnoverStats" class="btn-primary-sm self-end mt-4 sm:mt-0" :disabled="isLoadingTurnover">
                   {{ isLoadingTurnover ? '查询中...' : '查询' }}
                 </button>
            </div>
        </div>
        <div v-if="isLoadingTurnover" class="flex justify-center items-center py-6">
          <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-slate-500">加载营业额数据...</p>
        </div>
        <div v-else-if="turnoverStats && turnoverStats.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                    <tr>
                        <th class="th-cell">日期/周期</th>
                        <th class="th-cell text-right">营业额 (¥)</th>
                        <th class="th-cell text-right">订单数</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                    <tr v-for="item in turnoverStats" :key="item.period" class="hover:bg-slate-50 transition-colors">
                        <td class="td-cell font-medium text-slate-700">{{ item.period_display || item.period }}</td>
                        <td class="td-cell text-right">{{ item.total_turnover.toFixed(2) }}</td>
                        <td class="td-cell text-right">{{ item.order_count }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else-if="!isLoadingTurnover" class="text-center py-8 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          暂无符合条件的营业额数据。
        </div>
    </section>

    <!-- Hot Items -->
    <section v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-slate-600">热销菜品 (Top 5)</h2>
        <div v-if="isLoadingHotDishes" class="flex justify-center items-center py-6">
          <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-slate-500">加载热销菜品...</p>
        </div>
        <ul v-else-if="hotDishes && hotDishes.length > 0" class="space-y-3">
          <li v-for="(dish, index) in hotDishes" :key="dish.dish_id" class="hot-item-card">
            <span class="hot-item-rank bg-blue-500">#{{ index + 1 }}</span>
            <div class="flex-grow">
              <p class="font-medium text-slate-800">{{ dish.name }}</p>
              <p class="text-sm text-slate-500">销量: {{ dish.total_quantity_sold }}</p>
            </div>
            <p class="text-lg font-semibold text-green-600">¥{{ dish.total_revenue.toFixed(2) }}</p>
          </li>
        </ul>
        <div v-else class="text-center py-8 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
          暂无热销菜品数据。
        </div>
      </div>

      <div class="bg-white p-5 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4 text-slate-600">热销套餐 (Top 5)</h2>
        <div v-if="isLoadingHotCombos" class="flex justify-center items-center py-6">
          <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-slate-500">加载热销套餐...</p>
        </div>
        <ul v-else-if="hotCombos && hotCombos.length > 0" class="space-y-3">
          <li v-for="(combo, index) in hotCombos" :key="combo.combo_id" class="hot-item-card">
            <span class="hot-item-rank bg-purple-500">#{{ index + 1 }}</span>
            <div class="flex-grow">
              <p class="font-medium text-slate-800">{{ combo.name }}</p>
              <p class="text-sm text-slate-500">销量: {{ combo.total_quantity_sold }}</p>
            </div>
            <p class="text-lg font-semibold text-green-600">¥{{ combo.total_revenue.toFixed(2) }}</p>
          </li>
        </ul>
        <div v-else class="text-center py-8 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
          暂无热销套餐数据。
        </div>
      </div>
    </section>

    <!-- Placeholder for Charts -->
    <section v-if="!isLoading" class="mt-10">
      <h2 class="text-xl font-semibold mb-4 text-slate-600">图表展示 (待实现)</h2>
      <div class="bg-white p-6 rounded-lg shadow-md text-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>图表组件 (例如 Chart.js) 将在此处集成，以可视化营业额趋势和热销商品占比等。</p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const isLoading = ref(false); 
const isLoadingTurnover = ref(false);
const isLoadingHotDishes = ref(false);
const isLoadingHotCombos = ref(false);
const errorMessage = ref('');

const overviewStats = ref(null);
const hotDishes = ref([]);
const hotCombos = ref([]);
const turnoverStats = ref([]);

const turnoverParams = reactive({
  period: 'daily', 
  startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], 
  endDate: new Date().toISOString().split('T')[0],
  limit: 10 
});

const clearMessages = () => { errorMessage.value = ''; };

const fetchOverviewStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/overview`);
    if (response.data && response.data.code === 0) {
      overviewStats.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取总览数据失败');
    }
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    errorMessage.value = error.response?.data?.message || error.message || '获取总览统计失败';
  }
};

const fetchHotDishes = async () => {
  isLoadingHotDishes.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/hot-dishes?limit=5`);
    if (response.data && response.data.code === 0) {
      hotDishes.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取热销菜品失败');
    }
  } catch (error) {
    console.error('Error fetching hot dishes:', error);
  } finally {
    isLoadingHotDishes.value = false;
  }
};

const fetchHotCombos = async () => {
  isLoadingHotCombos.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/statistics/hot-combos?limit=5`);
    if (response.data && response.data.code === 0) {
      hotCombos.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取热销套餐失败');
    }
  } catch (error) {
    console.error('Error fetching hot combos:', error);
  } finally {
    isLoadingHotCombos.value = false;
  }
};

const fetchTurnoverStats = async () => {
  isLoadingTurnover.value = true;
  clearMessages(); // Clear general error, or have specific error for turnover
  try {
    let params = { period: turnoverParams.period, limit: turnoverParams.limit };
    if (turnoverParams.period === 'custom') {
      if (!turnoverParams.startDate || !turnoverParams.endDate) {
        // This error should ideally be shown near the date inputs
        errorMessage.value = '自定义范围查询请选择开始和结束日期。'; 
        isLoadingTurnover.value = false;
        return;
      }
      params = { 
        period: 'custom',
        start_date: turnoverParams.startDate,
        end_date: turnoverParams.endDate
      };
    }
    
    const response = await axios.get(`${API_BASE_URL}/statistics/turnover`, { params });
    if (response.data && response.data.code === 0) {
      turnoverStats.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取营业额数据失败');
    }
  } catch (error) {
    console.error('Error fetching turnover stats:', error);
    errorMessage.value = error.response?.data?.message || error.message || '获取营业额统计失败';
    turnoverStats.value = [];
  } finally {
    isLoadingTurnover.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  clearMessages();
  await Promise.all([
    fetchOverviewStats(),
    fetchHotDishes(),
    fetchHotCombos(),
    fetchTurnoverStats()
  ]);
  isLoading.value = false;
});

</script>

<style scoped>
.stat-card {
  @apply p-5 rounded-xl text-white shadow-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:scale-105;
}
.stat-icon-wrapper {
    @apply p-3 rounded-full flex items-center justify-center shadow-md;
}
.stat-title {
  @apply text-sm font-medium uppercase tracking-wider opacity-90;
}
.stat-value {
  @apply text-2xl lg:text-3xl font-bold;
}

.label-form {
  @apply block text-sm font-medium text-slate-700 mb-1;
}

.select-field {
  @apply block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white min-w-[180px];
}

.input-field-sm {
  @apply block w-full px-3 py-1.5 text-sm border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400;
}

.btn-primary-sm {
  @apply px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors duration-150;
}

.th-cell {
  @apply px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider;
}

.td-cell {
  @apply px-4 py-3 whitespace-nowrap text-sm text-slate-600;
}

.hot-item-card {
  @apply flex items-center bg-slate-50 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150;
}

.hot-item-rank {
  @apply h-8 w-8 flex items-center justify-center rounded-full text-white font-semibold text-sm mr-3 shadow-sm;
}

</style> 