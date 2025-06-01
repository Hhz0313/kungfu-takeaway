<template>
  <div class="container mx-auto p-4 md:p-8 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">确认订单与支付</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-xl font-semibold text-blue-500">加载订单信息...</p>
      <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="pageError" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md mb-6" role="alert">
      <h2 class="font-bold text-lg mb-2">加载错误</h2>
      <p>{{ pageError }}</p>
      <router-link to="/menu" class="mt-4 inline-block text-blue-600 hover:underline">返回菜单</router-link>
    </div>
    
    <div v-else-if="!cart || cart.items.length === 0">
         <div class="text-center py-12 bg-white shadow-md rounded-lg">
            <p class="mt-6 text-xl font-semibold text-gray-700">您的购物车是空的</p>
            <p class="mt-2 text-gray-500">请先添加商品到购物车再进行结算。</p>
            <router-link to="/menu" class="mt-8 inline-block btn-primary">
            去逛逛
            </router-link>
        </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Address & Payment -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Address Selection -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-700">选择收货地址</h2>
            <router-link to="/addresses" class="text-sm text-blue-600 hover:underline">管理地址</router-link>
          </div>
          <div v-if="addresses.length === 0" class="text-gray-500">
            您还没有收货地址。请先 <router-link to="/addresses" class="text-blue-600 hover:underline">添加一个地址</router-link>。
          </div>
          <div v-else class="space-y-3 max-h-60 overflow-y-auto pr-2">
            <label v-for="address in addresses" :key="address.id" 
                   class="block p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                   :class="selectedAddressId === address.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300'">
              <input type="radio" :value="address.id" v-model="selectedAddressId" class="sr-only">
              <div class="flex justify-between items-start">
                <div>
                    <p class="font-medium text-gray-800">{{ address.recipient_name }} - {{ address.phone_number }}</p>
                    <p class="text-sm text-gray-600">
                        {{ address.building_name }} {{ address.room_details }}
                    </p>
                </div>
                <span v-if="address.is_default" class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">默认</span>
              </div>
            </label>
          </div>
           <p v-if="checkoutError && validationErrors.address" class="text-red-500 text-sm mt-2">{{ validationErrors.address }}</p>
        </section>

        <!-- Payment Method (Simplified) -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">支付方式</h2>
          <div class="p-4 border border-gray-300 rounded-lg bg-gray-50">
            <p class="font-medium text-gray-700">在线支付 (模拟)</p>
            <p class="text-sm text-gray-500">我们将模拟在线支付流程。</p>
          </div>
        </section>

        <!-- Order Notes -->
        <section class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-gray-700 mb-3">订单备注</h2>
          <textarea v-model="orderNotes" rows="3" placeholder="给商家留言 (例如: 口味要求、送达时间等)" class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"></textarea>
        </section>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white p-6 rounded-lg shadow-md sticky top-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-6 pb-4 border-b border-gray-200">订单概要</h2>
          <div v-if="cart && cart.items" class="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
            <div v-for="item in cart.items" :key="item.id" class="flex justify-between items-center text-sm">
              <div>
                <p class="text-gray-800 font-medium">{{ item.name }} <span class="text-gray-500">x{{ item.quantity }}</span></p>
                <p v-if="item.selected_flavors && item.selected_flavors.length > 0" class="text-xs text-gray-500">{{ item.selected_flavors.join(', ') }}</p>
              </div>
              <p class="text-gray-700">¥{{ (item.price_at_addition * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          
          <div class="border-t border-gray-200 pt-4 space-y-2">
            <div class="flex justify-between text-md text-gray-700">
              <span>商品总额</span>
              <span>¥{{ cartTotal.toFixed(2) }}</span>
            </div>
            <!-- <div class="flex justify-between text-md text-gray-700">
              <span>配送费</span>
              <span>¥0.00</span>
            </div> -->
            <div class="flex justify-between text-xl font-bold text-gray-800 mt-2">
              <span>应付总额</span>
              <span class="text-red-600">¥{{ cartTotal.toFixed(2) }}</span>
            </div>
          </div>

          <button 
            @click="handlePlaceOrder"
            class="w-full mt-8 btn-primary text-lg py-3"
            :disabled="isPlacingOrder || !selectedAddressId || addresses.length === 0"
          >
            {{ isPlacingOrder ? '提交订单中...' : '提交订单并支付' }}
          </button>
          <p v-if="checkoutError && !validationErrors.address" class="text-red-500 text-sm mt-3 text-center">{{ checkoutError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const DUMMY_USER_ID = "1";

const router = useRouter();

const cart = ref(null);
const addresses = ref([]);
const selectedAddressId = ref(null);
const orderNotes = ref('');

const isLoading = ref(true);
const isPlacingOrder = ref(false);
const pageError = ref(''); // For critical loading errors (cart/address fetch)
const checkoutError = ref(''); // For errors during order placement
const validationErrors = reactive({ address: '' });

const fetchCheckoutData = async () => {
  isLoading.value = true;
  pageError.value = '';
  checkoutError.value = '';
  try {
    const [cartResponse, addressesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/cart?user_id=${DUMMY_USER_ID}`),
      axios.get(`${API_BASE_URL}/addresses?user_id=${DUMMY_USER_ID}`)
    ]);

    if (cartResponse.data && cartResponse.data.code === 0) {
      cart.value = cartResponse.data.data;
      if (!cart.value.items || cart.value.items.length === 0) {
        // No need to fetch addresses if cart is empty, router will redirect or show message
        // but for this component, we might still want to show address section if user somehow lands here
      }
    } else {
      throw new Error(cartResponse.data.message || '获取购物车信息失败');
    }

    if (addressesResponse.data && addressesResponse.data.code === 0) {
      addresses.value = addressesResponse.data.data;
      const defaultAddress = addresses.value.find(addr => addr.is_default);
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress.id;
      }
    } else {
      throw new Error(addressesResponse.data.message || '获取地址列表失败');
    }

  } catch (error) {
    console.error("Error fetching checkout data:", error);
    pageError.value = error.message || '加载页面数据失败，请刷新重试。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCheckoutData);

const cartTotal = computed(() => {
  return cart.value?.total_amount || 0;
});

const validateCheckout = () => {
    checkoutError.value = '';
    validationErrors.address = '';
    let isValid = true;
    if (!selectedAddressId.value) {
        validationErrors.address = '请选择一个收货地址。';
        isValid = false;
    }
    if (!cart.value || cart.value.items.length === 0) {
        checkoutError.value = '您的购物车是空的，无法下单。';
        isValid = false;
    }
    return isValid;
};

const handlePlaceOrder = async () => {
  if (!validateCheckout()) return;

  isPlacingOrder.value = true;
  checkoutError.value = '';

  const orderPayload = {
    user_id: DUMMY_USER_ID,
    address_id: selectedAddressId.value,
    // Items will be taken from the user's current cart by the backend
    // total_amount will also be recalculated by backend from cart
    notes: orderNotes.value.trim(),
    // payment_method: 'simulated_online_payment' // Backend handles payment simulation
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderPayload);
    if (response.data && response.data.code === 0 && response.data.data.order_id) {
      const orderId = response.data.data.order_id;
      // Backend already simulates payment and clears cart upon successful order creation.
      router.push({ name: 'OrderSuccessPage', params: { orderId: orderId } });
    } else {
      throw new Error(response.data.message || '创建订单失败');
    }
  } catch (error) {
    console.error("Error placing order:", error);
    checkoutError.value = error.response?.data?.message || error.message || '下单过程中发生错误，请重试。';
  } finally {
    isPlacingOrder.value = false;
  }
};

</script>

<style scoped>
.btn-primary {
  @apply bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50;
}
</style> 