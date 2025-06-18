<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Page Header -->
      <div class="mb-8 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight text-slate-800">数据统计</h1>
          <p class="mt-1 text-sm text-slate-500">洞悉业务关键指标与趋势</p>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-4 mb-6">
        <div v-if="isLoading && !overviewStats" class="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="ml-3 text-lg font-medium text-slate-600">加载统计数据中...</p>
        </div>
        <div v-if="errorMessage && !isLoading" class="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-md shadow" role="alert">
          <div class="flex">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.97a1 1 0 012 0v5.06a1 1 0 11-2 0zm0 3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
            <div>
              <p class="font-bold">加载数据出错!</p>
              <p class="text-sm">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-red-600 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 transition-colors" aria-label="Close">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <section v-if="overviewStats && !isLoading" class="mb-10">
        <h2 class="text-xl font-semibold mb-4 text-slate-700">关键指标 (今日)</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="stat-card">
            <div class="stat-icon bg-blue-100 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="stat-title">今日营业额</p>
              <p class="stat-value text-blue-600">¥{{ overviewStats.todays_turnover?.toFixed(2) || '0.00' }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-green-100 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <div>
              <p class="stat-title">今日订单数</p>
              <p class="stat-value text-green-600">{{ overviewStats.todays_orders_count || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-yellow-100 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="stat-title">待处理订单</p>
              <p class="stat-value text-yellow-600">{{ overviewStats.pending_orders_count || 0 }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon bg-purple-100 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <div class="flex-grow">
              <p class="stat-title">在售项目数</p>
              <div class="flex items-baseline gap-x-2">
                <p class="stat-value text-purple-600">{{ overviewStats.available_items_count || 0 }}</p>
                <p class="text-xs text-slate-500">(菜品+套餐)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Turnover Stats -->
      <section v-if="!isLoading" class="mb-10 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 class="text-xl font-semibold mb-5 text-slate-700">营业额趋势</h2>
          <div class="flex flex-wrap gap-4 mb-5 items-center border-b border-slate-200 pb-5">
              <div>
                  <label for="turnoverPeriod" class="label-form">统计周期</label>
                  <select v-model="turnoverParams.period" @change="fetchTurnoverStats" class="select-field">
                      <option value="daily">最近7日</option>
                      <option value="weekly">按周</option>
                      <option value="monthly">按月</option>
                      <option value="custom">自定义</option>
                  </select>
              </div>
              <div v-if="turnoverParams.period === 'custom'" class="flex flex-wrap gap-4 items-end">
                  <div>
                      <label for="startDate" class="label-form">开始日期</label>
                      <input type="date" v-model="turnoverParams.startDate" class="input-field">
                  </div>
                  <div>
                      <label for="endDate" class="label-form">结束日期</label>
                      <input type="date" v-model="turnoverParams.endDate" class="input-field">
                  </div>
                   <button @click="fetchTurnoverStats" class="btn-primary" :disabled="isLoadingTurnover">
                     {{ isLoadingTurnover ? '查询中...' : '查询' }}
                   </button>
              </div>
          </div>
          <div v-if="isLoadingTurnover" class="flex justify-center items-center py-10 min-h-[350px]">
            <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-slate-500">加载图表数据...</p>
          </div>
          <div v-else-if="turnoverChartData.labels?.length > 0" class="h-[350px]">
              <Line :data="turnoverChartData" :options="chartOptions" />
          </div>
          <div v-else class="empty-chart-state min-h-[350px]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p class="text-slate-500 font-medium">暂无符合条件的营业额数据</p>
            <p class="text-sm text-slate-400">请尝试更换筛选条件</p>
          </div>
      </section>

      <!-- Hot Items -->
      <section v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 class="text-xl font-semibold mb-4 text-slate-700">热销菜品 (Top 5)</h2>
          <div v-if="isLoadingHotDishes" class="flex justify-center items-center py-6 min-h-[300px]">
            <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-slate-500">加载热销菜品...</p>
          </div>
          <div v-else-if="hotDishesChartData.labels?.length > 0" class="h-[300px]">
            <Bar :data="hotDishesChartData" :options="chartOptions" />
          </div>
          <div v-else class="empty-chart-state min-h-[300px]">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
            <p class="text-slate-500 font-medium">暂无热销菜品数据</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 class="text-xl font-semibold mb-4 text-slate-700">热销套餐 (Top 5)</h2>
          <div v-if="isLoadingHotCombos" class="flex justify-center items-center py-6 min-h-[300px]">
            <svg class="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-slate-500">加载热销套餐...</p>
          </div>
          <div v-else-if="hotCombosChartData.labels?.length > 0" class="h-[300px]">
             <Bar :data="hotCombosChartData" :options="chartOptions" />
          </div>
          <div v-else class="empty-chart-state min-h-[300px]">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
            <p class="text-slate-500 font-medium">暂无热销套餐数据</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import axios from 'axios';
import { Line, Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';

ChartJS.register(
    Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement, Filler
);

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
  startDate: '', 
  endDate: '',
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
    hotDishes.value = [];
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
    hotCombos.value = [];
  } finally {
    isLoadingHotCombos.value = false;
  }
};

const fetchTurnoverStats = async () => {
  isLoadingTurnover.value = true;
  clearMessages();
  try {
    let params = { period: turnoverParams.period };
    if (turnoverParams.period === 'custom') {
      if (!turnoverParams.startDate || !turnoverParams.endDate) {
        errorMessage.value = '自定义范围查询请选择开始和结束日期。'; 
        isLoadingTurnover.value = false;
        return;
      }
      params.start_date = turnoverParams.startDate;
      params.end_date = turnoverParams.endDate;
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
  const today = new Date();
  turnoverParams.endDate = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
  turnoverParams.startDate = sevenDaysAgo.toISOString().split('T')[0];
  
  await Promise.all([
    fetchOverviewStats(),
    fetchHotDishes(),
    fetchHotCombos(),
    fetchTurnoverStats()
  ]);
  isLoading.value = false;
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const turnoverChartData = computed(() => ({
  labels: turnoverStats.value.map(item => item.period_display),
  datasets: [
    {
      label: '营业额 (元)',
      data: turnoverStats.value.map(item => item.total_turnover),
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      tension: 0.3,
      fill: true,
    }
  ]
}));

const hotDishesChartData = computed(() => ({
  labels: hotDishes.value.map(d => d.dish_name),
  datasets: [
    {
      label: '销量',
      data: hotDishes.value.map(d => d.total_quantity_sold),
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }
  ]
}));

const hotCombosChartData = computed(() => ({
  labels: hotCombos.value.map(c => c.combo_name),
  datasets: [
    {
      label: '销量',
      data: hotCombos.value.map(c => c.total_quantity_sold),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }
  ]
}));

</script>

<style scoped>
.stat-card {
  @apply bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-x-5 transition-all duration-300 hover:shadow-md hover:border-blue-300;
}
.stat-icon {
    @apply p-3 rounded-full inline-flex items-center justify-center;
}
.stat-title {
  @apply text-sm font-medium text-slate-500 mb-1;
}
.stat-value {
  @apply text-2xl lg:text-3xl font-bold text-slate-800;
}

.label-form {
  @apply block text-xs font-medium text-slate-600 mb-1;
}

.select-field {
  @apply block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm bg-white hover:border-slate-400 transition min-w-[180px];
}

.input-field {
  @apply block w-full px-3 py-1.5 text-sm border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 hover:border-slate-400 transition;
}

.btn-primary {
  @apply px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors;
}

.empty-chart-state {
  @apply flex flex-col justify-center items-center text-center py-8;
}
</style> 