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
      <div class="text-center py-20">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">您还没有任何订单</h2>
        <p class="text-gray-500 mb-8">快去菜单看看有什么好吃的吧！</p>
        <router-link to="/home/menu" class="mt-8 inline-block btn-primary">
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
          <p class="text-sm text-gray-500 mt-2 sm:mt-0">{{ formatTimeInChina(order.created_at) }}</p>
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
                <span :class="order.payment_status === 'paid' ? 'text-green-700' : 'text-orange-600'" class="text-sm font-semibold">
                  {{ translatePaymentStatus(order.payment_status) }}
                </span>
            </div>
        </div>
        
        <!-- Removed order items summary as it's not available in history list -->

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
import { formatTimeInChina } from '@/utils/formatters';

const orders = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');

const orderStatusMap = {
  pending: '待处理',
  preparing: '准备中',
  'out-for-delivery': '派送中',
  completed: '已完成',
  cancelled: '已取消',
  'payment-failed': '支付失败'
};

const paymentStatusMap = {
    unpaid: '待支付',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款'
};

const translateOrderStatus = (statusKey) => orderStatusMap[statusKey] || statusKey;
const translatePaymentStatus = (statusKey) => paymentStatusMap[statusKey] || statusKey;

const getStatusClass = (statusKey) => {
  switch (statusKey) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'preparing': return 'bg-blue-100 text-blue-800';
    case 'out-for-delivery': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    case 'payment-failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const fetchOrderHistory = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Correct API call, no dummy ID, relying on auth interceptor
    const response = await axios.get('/api/orders/history');
    if (response.data && response.data.code === 0) {
      // The data from history does not contain items, which is correct.
      orders.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取订单历史失败');
    }
  } catch (error) {
    console.error("Error fetching order history:", error);
    errorMessage.value = error.response?.data?.message || error.message || '无法加载订单历史，请稍后再试。';
    orders.value = []; // Ensure orders is an empty array on error
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrderHistory);

const sortedOrders = computed(() => {
  if (!Array.isArray(orders.value)) return [];
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