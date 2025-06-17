<template>
  <div class="container mx-auto p-4 md:p-8 max-w-3xl">
    <div class="mb-6">
        <router-link :to="{ name: 'OrderHistoryPage' }" class="text-blue-600 hover:text-blue-800 hover:underline">&larr; 返回订单历史</router-link>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-xl font-semibold text-blue-500">加载订单详情...</p>
      <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
      <h2 class="font-bold text-lg mb-2">加载错误</h2>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="order" class="bg-white shadow-xl rounded-lg overflow-hidden">
      <!-- Order Header -->
      <div class="bg-gray-50 p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">订单详情</h1>
            <p class="text-sm text-gray-500 mt-1">订单号: <span class="font-mono tracking-wide">{{ order.id }}</span></p>
          </div>
          <div class="text-sm text-gray-600 text-left sm:text-right">
            <p>下单时间: {{ formatTimeInChina(order.created_at) }}</p>
            <p>更新时间: {{ formatTimeInChina(order.updated_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Order Status & Payment -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">订单状态</p>
          <span :class="getStatusClass(order.status)" class="px-3 py-1.5 text-base font-semibold rounded-full inline-block">
            {{ translateOrderStatus(order.status) }}
          </span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">支付状态</p>
          <span :class="order.payment_status === 'paid' ? 'text-green-700' : 'text-orange-600'" class="text-base font-semibold">
            {{ translatePaymentStatus(order.payment_status) }}
          </span>
           <p v-if="order.payment_method" class="text-xs text-gray-500 mt-0.5">(支付方式: {{ order.payment_method }})</p>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">配送地址</h2>
        <div v-if="order.shipping_address" class="text-gray-600 leading-relaxed">
          <p><strong>{{ order.shipping_address.recipient_name }}</strong></p>
          <p>{{ order.shipping_address.phone_number }}</p>
          <p>{{ order.shipping_address.building_name }}</p>
          <p>{{ order.shipping_address.room_details }}</p>
        </div>
        <p v-else class="text-gray-500">未提供配送地址信息。</p>
      </div>

      <!-- Order Items -->
      <div class="p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">商品列表</h2>
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.id" class="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
            <img :src="getItemImageUrl(item.image_url)" :alt="item.name" class="w-16 h-16 bg-gray-200 rounded-md object-cover">
            <div class="flex-grow">
              <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">{{ (item.dish_id ? '菜品' : '套餐') }}</p>
              <p v-if="item.selected_flavors && item.selected_flavors.length > 0" class="text-xs text-gray-500">
                 {{ formatFlavors(item.selected_flavors) }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm text-gray-600">¥{{ item.price.toFixed(2) }} x {{ item.quantity }}</p>
              <p class="font-semibold text-gray-800">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Notes -->
      <div v-if="order.notes" class="p-6 border-t border-gray-200 bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-700 mb-2">订单备注</h2>
          <p class="text-gray-600 whitespace-pre-wrap">{{ order.notes }}</p>
      </div>

      <!-- Order Total -->
      <div class="p-6 bg-gray-100 text-right">
        <!-- <div class="flex justify-end mb-1">
          <span class="text-gray-600 mr-2">商品小计:</span>
          <span class="font-semibold text-gray-800">¥{{ order.total_amount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-end mb-2">
          <span class="text-gray-600 mr-2">配送费:</span>
          <span class="font-semibold text-gray-800">¥0.00</span>
        </div> -->
        <div class="flex justify-end items-baseline">
          <span class="text-xl font-bold text-gray-800 mr-2">订单总额:</span>
          <span class="text-3xl font-bold text-red-600">¥{{ order.total_amount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading && !order" class="text-center py-10 bg-white shadow-md rounded-lg">
        <p class="text-xl text-gray-500">未找到该订单的信息。</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { formatTimeInChina } from '@/utils/formatters';

const route = useRoute();
const orderId = computed(() => route.params.orderId);
const order = ref(null);
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
    case 'cancelled': return 'bg-gray-200 text-gray-700';
    case 'payment-failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const formatFlavors = (flavors) => {
  if (!flavors) return '';
  try {
    const parsed = typeof flavors === 'string' ? JSON.parse(flavors) : flavors;
    if (!Array.isArray(parsed) || parsed.length === 0) return '';
    return parsed.map(f => `${f.name}: ${f.value}`).join('; ');
  } catch (e) {
    return '';
  }
};

const getItemImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
};

const fetchOrderDetails = async () => {
  if (!orderId.value) {
    errorMessage.value = '无效的订单ID。';
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  order.value = null; // Reset on fetch
  try {
    // Correct API call using relative path, relying on auth interceptor
    const response = await axios.get(`/api/orders/${orderId.value}`);
    if (response.data && response.data.code === 0) {
      order.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取订单详情失败');
    }
  } catch (error) {
    console.error(`Error fetching order details for ${orderId.value}:`, error);
    errorMessage.value = error.response?.data?.message || error.message || '无法加载订单详情，请稍后再试。';
    if (error.response?.status === 404) {
        errorMessage.value = `订单 (ID: ${orderId.value}) 未找到。`;
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrderDetails);

</script>

<style scoped>
/* Additional specific styles if needed */
</style> 