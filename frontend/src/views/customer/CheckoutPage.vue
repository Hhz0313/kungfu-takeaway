<template>
  <div class="bg-gray-100 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">确认订单</h1>
      
      <!-- Loading or Empty State -->
      <div v-if="isLoading" class="text-center py-12">
        <p>正在加载订单信息...</p>
      </div>
      <div v-else-if="!cartItems.length" class="text-center py-12">
        <p>您的购物车是空的。</p>
        <router-link to="/home/menu" class="text-indigo-600 hover:underline">去点餐</router-link>
      </div>
      
      <!-- Main Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Address and Payment -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">配送地址</h2>
            <div v-if="addressError" class="bg-red-100 text-red-700 p-3 rounded-md text-center">
              {{ addressError }}
            </div>
            <div v-else-if="addresses.length > 0" class="space-y-4">
              <div v-for="addr in addresses" :key="addr.id" 
                   @click="selectedAddressId = addr.id"
                   :class="['p-4 border rounded-lg cursor-pointer transition', selectedAddressId === addr.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200']">
                <p class="font-bold">{{ addr.recipient_name }} - {{ addr.phone_number }}</p>
                <p class="text-gray-600">{{ addr.building_name }} {{ addr.room_details }}</p>
                <span v-if="addr.is_default" class="text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-full">默认地址</span>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p>您还没有添加地址。</p>
              <router-link to="/home/my-addresses" class="text-indigo-600 hover:underline">去添加</router-link>
            </div>
          </div>
          
          <!-- Payment Method -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">支付方式</h2>
            <div class="p-4 rounded-lg" :class="{ 'border-2 border-indigo-500 bg-indigo-50': paymentMethod === 'balance' }">
              <label class="flex items-center">
                <input type="radio" v-model="paymentMethod" value="balance" class="form-radio h-5 w-5 text-indigo-600" :disabled="user.balance < totalPrice">
                <span class="ml-3 font-semibold">余额支付 (可用: ¥{{ user.balance.toFixed(2) }})</span>
              </label>
              <p v-if="user.balance < totalPrice" class="text-red-500 text-sm mt-1">
                余额不足, <router-link to="/home/profile" class="underline">请先充值</router-link>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Order Summary -->
        <div class="bg-white rounded-lg shadow-md">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold">订单概要</h2>
          </div>
          <div class="p-6 space-y-4">
            <div v-for="item in cartItems" :key="item.id" class="flex justify-between items-center">
              <div>
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-sm text-gray-500">x {{ item.quantity }}</p>
              </div>
              <p class="font-semibold">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          <div class="p-6 border-t space-y-2">
             <div class="flex justify-between font-bold text-xl">
              <span>总计</span>
              <span>¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          <div class="p-6">
            <button @click="placeOrder" 
                    :disabled="isSubmitting || !canPlaceOrder"
                    class="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {{ isSubmitting ? '正在下单...' : '确认下单' }}
            </button>
             <p v-if="!selectedAddressId" class="text-red-500 text-sm text-center mt-2">请选择一个配送地址</p>
            <p v-else-if="user.balance < totalPrice" class="text-red-500 text-sm text-center mt-2">
              余额不足, <router-link to="/home/profile" class="underline">请先充值</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const isLoading = ref(true);
const cartItems = ref([]);
const addresses = ref([]);
const user = ref({ balance: 0 });
const selectedAddressId = ref(null);
const paymentMethod = ref('balance');
const isSubmitting = ref(false);
const router = useRouter();
const addressError = ref(''); // To hold address-specific errors

const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const canPlaceOrder = computed(() => {
  return selectedAddressId.value && user.value.balance >= totalPrice.value;
});

const fetchData = async () => {
  isLoading.value = true;
  addressError.value = '';

  try {
    // Fetch cart and user info first, as they are critical.
    const [cartRes, userRes] = await Promise.all([
      axios.get('/api/cart'),
      axios.get('/api/users/profile')
    ]);

    cartItems.value = cartRes.data;
    user.value = userRes.data;

    if (cartItems.value.length === 0) {
      isLoading.value = false;
      return; // Stop if cart is empty
    }

    // Then, fetch addresses. If it fails, the page can still render.
    try {
      const addressRes = await axios.get('/api/addresses'); // Corrected path
      if (addressRes.data && addressRes.data.code === 0 && Array.isArray(addressRes.data.data)) {
        addresses.value = addressRes.data.data; // Correctly access the data array
        const defaultAddress = addresses.value.find(addr => addr.is_default);
        if (defaultAddress) {
          selectedAddressId.value = defaultAddress.id;
        }
      } else {
        // Handle cases where response is not as expected
        throw new Error(addressRes.data.message || '获取地址的响应格式不正确');
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
      addressError.value = `无法加载地址: ${err.response?.data?.message || err.message}`;
    }

  } catch (error) {
    console.error("Failed to fetch critical checkout data:", error);
    // If critical data (cart/user) fails, show a general error.
    // The template will show "cart is empty" if cartItems is empty.
  } finally {
    isLoading.value = false;
  }
};

const placeOrder = async () => {
  if (!canPlaceOrder.value) return;

  isSubmitting.value = true;
  try {
    const response = await axios.post('/api/orders', {
      addressId: selectedAddressId.value,
      paymentMethod: paymentMethod.value,
      remark: ''
    });

    // On success, redirect to an order success page
    router.push({ name: 'OrderSuccessPage', params: { orderId: response.data.orderId } });

  } catch (error) {
    alert(error.response?.data?.message || '下单失败，请稍后再试');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchData);
</script> 