<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Page Header -->
      <div class="mb-6 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight text-slate-800">订单处理</h1>
          <p class="mt-1 text-sm text-slate-500">查看和管理所有用户订单</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow-md border border-slate-200">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div>
            <label for="statusFilter" class="block text-sm font-medium text-slate-600 mb-1">按状态筛选</label>
            <select id="statusFilter" v-model="selectedStatusFilter" @change="fetchOrders" class="select-field w-48">
              <option value="all">所有状态</option>
              <option v-for="status in orderStatuses" :key="status.value" :value="status.value">
                {{ status.text }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-4 mb-6">
        <!-- Loading Indicator -->
        <div v-if="isLoading && !orders.length" class="flex justify-center items-center py-10 bg-white rounded-lg shadow-sm">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="ml-3 text-lg font-medium text-slate-600">加载订单数据中...</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-md shadow" role="alert">
          <div class="flex">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.97a1 1 0 012 0v5.06a1 1 0 11-2 0zm0 3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
            <div>
              <p class="font-bold">操作失败</p>
              <p class="text-sm">{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-red-600 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 transition-colors" aria-label="Close">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-md shadow" role="alert">
          <div class="flex">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
            <div>
              <p class="font-bold">操作成功</p>
              <p class="text-sm">{{ successMessage }}</p>
            </div>
            <button @click="successMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-green-600 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex h-8 w-8 transition-colors" aria-label="Close">
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div v-if="!isLoading || orders.length > 0" class="space-y-6">
        <div v-for="order in orders" :key="order.id" class="bg-white shadow-lg rounded-xl p-5 md:p-6 hover:shadow-xl transition-shadow duration-300 border border-slate-200">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-4 mb-4 pb-4 border-b border-slate-200">
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider">订单号</p>
              <p class="font-semibold text-slate-800 truncate" :title="order.id">#{{ order.id.substring(0, 12) }}...</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider">下单时间</p>
              <p class="text-sm text-slate-700">{{ formatToBeijingTime(order.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider">总金额</p>
              <p class="font-semibold text-lg text-blue-600">¥{{ order.total_amount.toFixed(2) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider">支付状态</p>
              <p class="text-sm font-medium" :class="order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'">{{ translatePaymentStatus(order.payment_status) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider">当前状态</p>
              <p class="font-semibold text-sm py-1 px-2.5 rounded-full inline-block" :class="getStatusPillClasses(order.status)">{{ translateOrderStatus(order.status) }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
              <div class="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">配送至</p>
                  <div v-if="order.address">
                      <p class="text-sm text-slate-800 font-semibold">
                          {{ order.address.recipient_name }} ({{ order.address.phone_number }})
                      </p>
                      <p class="text-sm text-slate-600">
                          {{ order.address.building_name }} - {{ order.address.room_details }}
                      </p>
                  </div>
                  <p v-else class="text-sm text-slate-500 italic">地址信息缺失</p>
              </div>
               <div class="bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                  <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">订单备注</p>
                  <p class="text-sm text-slate-600 italic">{{ order.remark || '无备注' }}</p>
              </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-x-6 gap-y-4 mt-6 mb-4">
            <div class="flex items-center gap-3">
              <label :for="`statusUpdate-${order.id}`" class="text-sm font-medium text-slate-700 whitespace-nowrap">更新状态:</label>
              <select :id="`statusUpdate-${order.id}`" v-model="order.new_status" class="select-field flex-grow min-w-[150px]" :disabled="availableOrderStatusesForUpdate(order.status).length === 0">
                <option value="" disabled>选择新状态...</option>
                <option v-for="status in availableOrderStatusesForUpdate(order.status)" :key="status.value" :value="status.value">
                  {{ status.text }}
                </option>
              </select>
              <button @click="updateOrderStatus(order.id, order.new_status)" class="btn-primary whitespace-nowrap" :disabled="!order.new_status || order.new_status === order.status || isUpdatingStatus[order.id]">
                {{ isUpdatingStatus[order.id] ? '更新中...' : '确认' }}
              </button>
            </div>
          </div>
          
          <div class="border-t border-slate-200 pt-4 mt-4">
              <button @click="toggleOrderItems(order.id)" class="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1.5 px-2.5 rounded-md hover:bg-blue-50 transition-colors duration-150 w-full text-left">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 transition-transform duration-300" :class="{'rotate-180': expandedOrder === order.id}" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  {{ expandedOrder === order.id ? '隐藏订单项目' : '查看订单项目' }} 
              </button>
              <div v-if="expandedOrder === order.id" class="mt-3 ml-4 pl-4 border-l-2 border-blue-200 space-y-2">
                  <div v-for="item in order.items" :key="item.id" class="p-3 bg-white rounded-lg shadow-sm flex justify-between items-center border border-slate-200">
                      <div>
                          <p class="font-medium text-sm text-slate-800">{{ item.name }} <span class="text-xs text-slate-500">({{ item.dish_id ? '菜品' : '套餐' }})</span></p>
                          <p class="text-xs text-slate-600">数量: {{ item.quantity }} &nbsp;&times;&nbsp; ¥{{ item.price.toFixed(2) }}</p>
                      </div>
                      <p class="font-semibold text-sm text-slate-800">¥{{ (item.quantity * item.price).toFixed(2) }}</p>
                  </div>
                   <p v-if="!order.items || order.items.length === 0" class="text-sm text-slate-500 italic text-center py-2">此订单没有项目信息。</p>
              </div>
          </div>
        </div>
      </div>
      <div v-if="!isLoading && orders.length === 0" class="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-slate-200">
        <svg class="mx-auto h-16 w-16 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6m-6 0a.75.75 0 001.085.67l.415-.207A.75.75 0 009 10.5zm3.75-3.75a.75.75 0 00-1.085-.67l-.415.207a.75.75 0 00-1.085.67V6.75m0 9.75h.008v.008h-.008V16.5zm-3.75 0h.008v.008h-.008V16.5zm-3.75 0h.008v.008h-.008V16.5z" />
        </svg>
        <p class="mt-4 text-xl font-semibold text-slate-600">没有符合条件的订单</p>
        <p class="mt-2 text-sm text-slate-500">尝试更改筛选条件或等待新订单。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const orders = ref([]);
const isLoading = ref(false);
const isUpdatingStatus = ref({}); // Tracks loading state for individual order updates
const errorMessage = ref('');
const successMessage = ref('');
const expandedOrder = ref(null); 

const selectedStatusFilter = ref('all');
const orderStatuses = [
  { value: 'pending', text: '待确认' },
  { value: 'confirmed', text: '已确认' },
  { value: 'preparing', text: '准备中' },
  { value: 'delivering', text: '派送中' },
  { value: 'completed', text: '已完成' },
  { value: 'cancelled', text: '已取消' },
  { value: 'refunded', text: '已退款' },
];

const paymentStatuses = {
    unpaid: '待支付',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款'
};

const translateOrderStatus = (statusKey) => {
  const status = orderStatuses.find(s => s.value === statusKey);
  return status ? status.text : statusKey;
};

const translatePaymentStatus = (statusKey) => {
    return paymentStatuses[statusKey] || statusKey;
};

const formatToBeijingTime = (dateString) => {
  if (!dateString) return '时间不可用';
  return dayjs.utc(dateString).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
};

const getStatusPillClasses = (statusKey) => {
  switch (statusKey) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-sky-100 text-sky-800';
    case 'preparing': return 'bg-blue-100 text-blue-800';
    case 'delivering': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-gray-200 text-gray-700';
    case 'refunded': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const availableOrderStatusesForUpdate = (currentStatus) => {
    const transitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['delivering', 'cancelled'],
        delivering: ['completed'],
    };
    const allowedTransitions = transitions[currentStatus] || [];
    if (['completed', 'cancelled', 'refunded'].includes(currentStatus)) {
        return [];
    }
    return orderStatuses.filter(s => allowedTransitions.includes(s.value));
};

const clearMessages = (duration = 0) => { 
    if (duration > 0) {
        setTimeout(() => {
            errorMessage.value = ''; successMessage.value = '';
        }, duration);
    } else {
        errorMessage.value = ''; successMessage.value = '';
    }
};

const fetchOrders = async () => {
  isLoading.value = true;
  clearMessages();
  let url = `${API_BASE_URL}/orders/admin/all`;
  if (selectedStatusFilter.value !== 'all') {
    url += `?status=${selectedStatusFilter.value}`;
  }

  try {
    const response = await axios.get(url);
    if (response.data && response.data.code === 0) {
      orders.value = response.data.data.map(order => ({ ...order, new_status: '' }));
    } else {
      throw new Error(response.data.message || '获取订单列表失败');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    errorMessage.value = error.response?.data?.message || error.message || '获取订单数据失败';
    clearMessages(5000);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

const updateOrderStatus = async (orderId, newStatus) => {
  if (!newStatus) {
    errorMessage.value = '请选择一个目标状态。';
    clearMessages(3000);
    return;
  }
  isUpdatingStatus.value[orderId] = true;
  clearMessages();
  try {
    const response = await axios.put(`${API_BASE_URL}/orders/admin/${orderId}`, { status: newStatus });
    if (response.data && response.data.code === 0) {
      successMessage.value = `订单 #${orderId.substring(0,8)}... 状态已更新为 ${translateOrderStatus(newStatus)}。`;
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        if (selectedStatusFilter.value !== 'all' && selectedStatusFilter.value !== newStatus) {
            orders.value.splice(orderIndex, 1);
        } else {
            orders.value[orderIndex].status = newStatus;
            orders.value[orderIndex].new_status = '';
        }
      }
      clearMessages(4000);
    } else {
      throw new Error(response.data.message || '更新订单状态失败');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    errorMessage.value = error.response?.data?.message || error.message || '更新订单状态失败';
    clearMessages(5000);
  } finally {
    isUpdatingStatus.value[orderId] = false;
  }
};

const toggleOrderItems = (orderId) => {
    if (expandedOrder.value === orderId) {
        expandedOrder.value = null;
    } else {
        expandedOrder.value = orderId;
    }
}
</script>

<style scoped>
.select-field {
  @apply block w-full pl-3 pr-10 py-2 text-sm border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm bg-white hover:border-slate-400 transition;
}
.btn-primary {
  @apply px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}
</style> 