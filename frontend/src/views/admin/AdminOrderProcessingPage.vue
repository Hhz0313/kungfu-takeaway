<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6 text-slate-700">订单处理</h1>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-x-6 gap-y-4">
      <div>
        <label for="statusFilter" class="block text-sm font-medium text-slate-700 mb-1">按状态筛选:</label>
        <select id="statusFilter" v-model="selectedStatusFilter" @change="fetchOrders(1)" class="select-field">
          <option value="all">所有状态</option>
          <option v-for="status in orderStatuses" :key="status.value" :value="status.value">
            {{ status.text }}
          </option>
        </select>
      </div>
      <!-- Add more filters here if needed, e.g., date range -->
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading && !orders.length" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="ml-3 text-lg font-medium text-slate-600">加载订单数据中...</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
      <div class="flex">
        <div class="py-1"><svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.03V7.97a1 1 0 012 0v5.06a1 1 0 11-2 0zm0 3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
        <div>
          <p class="font-bold">错误!</p>
          <p class="text-sm">{{ errorMessage }}</p>
        </div>
        <button @click="errorMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex h-8 w-8" aria-label="Close">
          <span class="sr-only">Dismiss</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
      <div class="flex">
        <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
        <div>
          <p class="font-bold">成功!</p>
          <p class="text-sm">{{ successMessage }}</p>
        </div>
         <button @click="successMessage = ''" class="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-100 inline-flex h-8 w-8" aria-label="Close">
          <span class="sr-only">Dismiss</span>
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div v-if="!isLoading || orders.length > 0" class="space-y-6">
      <div v-for="order in orders" :key="order.id" class="bg-white shadow-lg rounded-xl p-5 md:p-6 hover:shadow-xl transition-shadow duration-300">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 mb-4 pb-4 border-b border-slate-200">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">订单号</p>
            <p class="font-semibold text-slate-700 truncate" :title="order.id">#{{ order.id.substring(0, 12) }}...</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">下单时间</p>
            <p class="text-sm text-slate-700">{{ new Date(order.created_at).toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">总金额</p>
            <p class="font-semibold text-lg text-blue-600">¥{{ order.total_amount.toFixed(2) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider">支付状态</p>
            <p class="text-sm font-medium" :class="order.payment_status === 'Paid' ? 'text-green-600' : 'text-amber-600'">{{ translatePaymentStatus(order.payment_status) }}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
            <div class="bg-slate-50 p-3 rounded-md">
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">配送至</p>
                <p class="text-sm text-slate-700 font-medium" v-if="order.address">
                    {{ order.address.recipient_name }} ({{ order.address.phone_number }})
                </p>
                <p class="text-sm text-slate-600" v-if="order.address">
                    {{ order.address.building_name }} - {{ order.address.room_details }}
                </p>
                <p v-else class="text-sm text-slate-500 italic">地址信息缺失</p>
            </div>
             <div class="bg-slate-50 p-3 rounded-md">
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">订单备注</p>
                <p class="text-sm text-slate-600 italic">{{ order.notes || '无备注' }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-x-6 gap-y-4 mb-4">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">当前状态</p>
            <p class="font-semibold text-md py-1 px-2.5 rounded-full inline-block" :class="getStatusPillClasses(order.status)">{{ translateOrderStatus(order.status) }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label :for="`statusUpdate-${order.id}`" class="text-sm font-medium text-slate-700 whitespace-nowrap">更新状态:</label>
            <select :id="`statusUpdate-${order.id}`" v-model="order.new_status" class="select-field-sm flex-grow min-w-[150px]">
              <option value="" disabled>选择新状态...</option>
              <option v-for="status in availableOrderStatusesForUpdate(order.status)" :key="status.value" :value="status.value">
                {{ status.text }}
              </option>
            </select>
            <button @click="updateOrderStatus(order.id, order.new_status)" class="btn-primary-sm" :disabled="!order.new_status || order.new_status === order.status || isUpdatingStatus[order.id]">
              {{ isUpdatingStatus[order.id] ? '更新中...' : '确认更新' }}
            </button>
          </div>
        </div>
        
        <div class="border-t border-slate-200 pt-4 mt-4">
            <button @click="toggleOrderItems(order.id)" class="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1.5 px-2.5 rounded-md hover:bg-blue-50 transition-colors duration-150">
                {{ expandedOrder === order.id ? '隐藏订单项目' : '查看订单项目' }} 
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1.5 transition-transform duration-200" :class="{'rotate-180': expandedOrder === order.id}" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div v-if="expandedOrder === order.id" class="mt-3 space-y-2 bg-slate-50 p-3 rounded-md">
                <div v-for="item in order.items" :key="item.id" class="p-2.5 bg-white rounded-md shadow-sm flex justify-between items-center hover:shadow-md transition-shadow duration-150">
                    <div>
                        <p class="font-medium text-sm text-slate-800">{{ item.name }} <span class="text-xs text-slate-500">({{ item.type === 'dish' ? '菜品' : '套餐' }})</span></p>
                        <p class="text-xs text-slate-600">数量: {{ item.quantity }} &nbsp;&times;&nbsp; ¥{{ item.price_at_order.toFixed(2) }}</p>
                    </div>
                    <p class="font-semibold text-sm text-slate-800">¥{{ (item.quantity * item.price_at_order).toFixed(2) }}</p>
                </div>
                 <p v-if="!order.items || order.items.length === 0" class="text-sm text-slate-500 italic text-center py-2">此订单没有项目信息。</p>
            </div>
        </div>

      </div>
    </div>
    <div v-if="!isLoading && orders.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="mt-3 text-xl font-medium text-slate-500">没有符合条件的订单</p>
      <p class="mt-1 text-sm text-slate-400">尝试更改筛选条件或等待新订单。</p>
    </div>

    <!-- Pagination (placeholder for now if not implemented) -->
    <!-- Add pagination controls here if you have many orders -->

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const orders = ref([]);
const isLoading = ref(false);
const isUpdatingStatus = ref({}); // Tracks loading state for individual order updates
const errorMessage = ref('');
const successMessage = ref('');
const expandedOrder = ref(null); 

const selectedStatusFilter = ref('all');
const orderStatuses = [
  { value: 'Pending', text: '待处理' },
  { value: 'Processing', text: '处理中' },
  { value: 'OutForDelivery', text: '派送中' },
  { value: 'Completed', text: '已完成' },
  { value: 'Cancelled', text: '已取消' },
  { value: 'PaymentFailed', text: '支付失败' },
];

const paymentStatuses = {
    Pending: '待支付',
    Paid: '已支付',
    Failed: '支付失败',
    Refunded: '已退款'
};

const translateOrderStatus = (statusKey) => {
  const status = orderStatuses.find(s => s.value === statusKey);
  return status ? status.text : statusKey;
};

const translatePaymentStatus = (statusKey) => {
    return paymentStatuses[statusKey] || statusKey;
};

const getStatusPillClasses = (statusKey) => {
  switch (statusKey) {
    case 'Pending': return 'bg-yellow-100 text-yellow-700';
    case 'Processing': return 'bg-blue-100 text-blue-700';
    case 'OutForDelivery': return 'bg-purple-100 text-purple-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'Cancelled': return 'bg-slate-100 text-slate-600';
    case 'PaymentFailed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const availableOrderStatusesForUpdate = (currentStatus) => {
    const transitions = {
        Pending: ['Processing', 'Cancelled'],
        Processing: ['OutForDelivery', 'Cancelled'],
        OutForDelivery: ['Completed', 'Cancelled'],
        PaymentFailed: ['Pending', 'Cancelled'], // Allow admin to reset to Pending for re-payment attempt
    };
    const allowedTransitions = transitions[currentStatus] || [];
    // For terminal states (Completed, Cancelled), no further transitions by admin generally.
    if (['Completed', 'Cancelled'].includes(currentStatus)) {
        return [];
    }
    return orderStatuses.filter(s => allowedTransitions.includes(s.value));
};

const clearMessages = () => { errorMessage.value = ''; successMessage.value = ''; };

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
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

const updateOrderStatus = async (orderId, newStatus) => {
  if (!newStatus) {
    errorMessage.value = '请选择一个目标状态。';
    return;
  }
  isUpdatingStatus.value[orderId] = true;
  clearMessages();
  try {
    const response = await axios.put(`${API_BASE_URL}/orders/admin/${orderId}/status`, { status: newStatus });
    if (response.data && response.data.code === 0) {
      successMessage.value = `订单 #${orderId.substring(0,8)}... 状态已更新为 ${translateOrderStatus(newStatus)}。`;
      // Find the order and update its status and new_status locally
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = newStatus;
        orders.value[orderIndex].new_status = ''; // Reset dropdown
      }
      // No full fetchOrders() needed if filter is 'all' or matches new status
      // However, if the filter would hide this order, a full refresh is safer or more complex local filtering logic.
      // For simplicity now, only refresh if filter might change visibility.
      if (selectedStatusFilter.value !== 'all' && selectedStatusFilter.value !== newStatus) {
         await fetchOrders();
      }

    } else {
      throw new Error(response.data.message || '更新订单状态失败');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    errorMessage.value = error.response?.data?.message || error.message || '更新订单状态失败';
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
  @apply block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm bg-white;
}
.select-field-sm {
  @apply block w-full pl-3 pr-8 py-1.5 text-xs border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md shadow-sm bg-white;
}
.btn-primary-sm {
  @apply px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-150;
}
</style> 