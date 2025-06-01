<template>
  <div class="container mx-auto p-4 md:p-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">我的订单历史</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-xl font-semibold text-blue-500">加载订单记录...</p>
      <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md mb-6" role="alert">
      <h2 class="font-bold text-lg mb-2">加载错误</h2>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="orders.length === 0">
      <div class="text-center py-12 bg-white shadow-md rounded-lg">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        <p class="mt-6 text-xl font-semibold text-gray-700">您还没有下过订单</p>
        <p class="mt-2 text-gray-500">快去菜单看看有什么好吃的吧！</p>
        <router-link to="/menu" class="mt-8 inline-block btn-primary">
          去点餐
        </router-link>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div v-for="order in sortedOrders" :key="order.id" class="bg-white p-5 md:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-3 pb-3 border-b border-gray-200">
          <div>
            <p class="text-xs text-gray-500">订单号:</p>
            <p class="font-mono text-sm text-gray-700 tracking-wide">{{ order.id }}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2 sm:mt-0">{{ new Date(order.created_at).toLocaleString() }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-center">
            <div>
                <p class="text-xs text-gray-500">总金额</p>
                <p class="text-xl font-semibold text-red-600">¥{{ order.total_amount.toFixed(2) }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-500">状态</p>
                <span :class="getStatusClass(order.status)" class="px-3 py-1 text-sm font-semibold rounded-full inline-block">
                    {{ translateOrderStatus(order.status) }}
                </span>
            </div>
             <div>
                <p class="text-xs text-gray-500">支付状态</p>
                <span :class="order.payment_status === 'Paid' ? 'text-green-700' : 'text-orange-600'" class="text-sm">
                  {{ translatePaymentStatus(order.payment_status) }}
                </span>
            </div>
        </div>
        
        <!-- Quick summary of items - could be brief -->
        <div class="mb-4">
            <p class="text-xs text-gray-500 mb-1">订单内容 ({{order.items.length}}项):</p>
            <div class="text-sm text-gray-600 space-y-0.5">
                <div v-for="item in order.items.slice(0, 2)" :key="item.id">
                    {{ item.name }} x {{ item.quantity }}
                </div>
                <div v-if="order.items.length > 2" class="italic text-gray-400">
                    ...等 {{ order.items.length }} 件商品
                </div>
            </div>
        </div>

        <div class="text-right mt-4">
          <router-link :to="{ name: 'OrderDetailPage', params: { orderId: order.id } }" class="btn-secondary">
            查看详情
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const DUMMY_USER_ID = "1";

const orders = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const orderStatusMap = {
  Pending: '待处理',
  Processing: '处理中',
  OutForDelivery: '派送中',
  Completed: '已完成',
  Cancelled: '已取消',
  PaymentFailed: '支付失败'
};

const paymentStatusMap = {
    Pending: '待支付',
    Paid: '已支付',
    Failed: '支付失败',
    Refunded: '已退款'
};

const translateOrderStatus = (statusKey) => orderStatusMap[statusKey] || statusKey;
const translatePaymentStatus = (statusKey) => paymentStatusMap[statusKey] || statusKey;

const getStatusClass = (statusKey) => {
  switch (statusKey) {
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Processing': return 'bg-blue-100 text-blue-800';
    case 'OutForDelivery': return 'bg-purple-100 text-purple-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-gray-100 text-gray-800';
    case 'PaymentFailed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const fetchOrderHistory = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/history?user_id=${DUMMY_USER_ID}`);
    if (response.data && response.data.code === 0) {
      orders.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取订单历史失败');
    }
  } catch (error) {
    console.error("Error fetching order history:", error);
    errorMessage.value = error.response?.data?.message || error.message || '无法加载订单历史，请稍后再试。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrderHistory);

const sortedOrders = computed(() => {
  // Sort by creation date, newest first
  return [...orders.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

</script>

<style scoped>
.btn-primary {
  @apply bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-base;
}
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 text-sm;
}
</style> 