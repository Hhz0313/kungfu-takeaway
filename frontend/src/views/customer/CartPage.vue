<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <h1 class="text-3xl md:text-4xl font-bold mb-8 text-gray-800 tracking-tight">我的购物车</h1>

      <div v-if="isLoading" class="text-center py-20">
        <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-4 text-lg font-semibold text-gray-600">正在加载购物车...</p>
      </div>

      <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md mb-6" role="alert">
        <h2 class="font-bold text-lg mb-2">出错了</h2>
        <p>{{ errorMessage }}</p>
      </div>
      
      <div v-if="successMessage" class="fixed top-24 right-6 bg-green-500 text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 transform animate-fade-in-down" role="alert">
          <p>{{ successMessage }}</p>
      </div>

      <div v-if="!isLoading && cartItems.length === 0 && !errorMessage">
        <div class="text-center py-16 px-6 bg-white shadow-lg rounded-xl">
          <svg class="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="mt-6 text-2xl font-semibold text-gray-800">您的购物车是空的</p>
          <p class="mt-2 text-gray-500">快去挑选一些美味的菜品吧！</p>
          <router-link to="/home/menu" class="mt-8 inline-block btn-primary-cart">
            去逛逛
          </router-link>
        </div>
      </div>

      <div v-if="!isLoading && cartItems.length > 0">
        <!-- Cart Items List -->
        <div class="bg-white shadow-lg rounded-xl overflow-hidden divide-y divide-gray-200/75">
          <div v-for="item in cartItems" :key="item.id" class="p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 transition-colors duration-300 hover:bg-gray-50/50">
            <img :src="getItemImageUrl(item.image_url)" :alt="item.name" class="w-28 h-28 object-cover rounded-lg border border-gray-200 flex-shrink-0">
            
            <div class="flex-grow min-w-0 text-center md:text-left">
              <h2 class="text-lg font-semibold text-gray-800 truncate">{{ item.name }}</h2>
              <p class="text-sm text-gray-500">{{ item.type === 'dish' ? '菜品' : '套餐' }}</p>
              <p v-if="item.selected_flavors && item.selected_flavors.length > 0" class="text-sm text-gray-600 mt-1 truncate">
                 口味: {{ formatFlavors(item.selected_flavors) }}
              </p>
            </div>

            <div class="flex items-center gap-4 md:gap-5 text-center flex-shrink-0">
              <p class="text-md text-gray-600 w-20">¥{{ (item.price || 0).toFixed(2) }}</p>
              
              <div class="flex items-center border border-gray-200 rounded-full">
                <button @click="updateItemQuantity(item, item.quantity - 1)" class="quantity-btn-cart">-</button>
                <span class="px-3 py-1 text-sm font-semibold text-gray-800 w-10 text-center">{{ item.quantity }}</span>
                <button @click="updateItemQuantity(item, item.quantity + 1)" class="quantity-btn-cart">+</button>
              </div>
              
              <p class="text-lg font-bold text-red-600 w-24">¥{{ ((item.price || 0) * item.quantity).toFixed(2) }}</p>

              <button @click="removeItem(item.id)" title="移除商品" class="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-all duration-200">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary and Actions -->
        <div class="mt-8 p-6 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center">
            <button
              @click="confirmClearCart"
              class="flex items-center px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 hover:text-red-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空购物车
            </button>
          </div>
          <div class="text-center md:text-right">
            <p class="text-lg text-gray-700">
              共 <span class="font-semibold text-blue-600">{{ cartItemCount }}</span> 件商品，总计: 
              <span class="text-3xl font-bold text-red-600 ml-2">¥{{ totalAmount.toFixed(2) }}</span>
            </p>
            <div class="mt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-end">
              <router-link to="/home/menu" class="btn-secondary-cart">
                继续点餐
              </router-link>
              <router-link to="/home/checkout" class="btn-primary-cart">
                去结算
              </router-link>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const cartItems = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');

// --- Core Logic ---

const fetchCartItems = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Interceptor handles auth. API now returns a direct array.
    const response = await axios.get('/api/cart');
    cartItems.value = response.data;
    // DO NOT set errorMessage when cart is empty. The template handles this case.
  } catch (error) {
    console.error('获取购物车失败:', error);
    errorMessage.value = `获取购物车信息失败: ${error.response?.data?.message || error.message}`;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCartItems);

const updateItemQuantity = async (item, newQuantity) => {
  if (newQuantity < 1) {
    await removeItem(item.id);
    return;
  }
  try {
    await axios.put(`/api/cart/items/${item.id}`, { quantity: newQuantity });
    successMessage.value = '数量已更新';
    await fetchCartItems(); // Refresh from server
  } catch (error) {
     errorMessage.value = `更新失败: ${error.response?.data?.message || error.message}`;
  } finally {
    setTimeout(() => { successMessage.value = '' }, 3000);
  }
};

const removeItem = async (cart_item_id) => {
  try {
    await axios.delete(`/api/cart/items/${cart_item_id}`);
    successMessage.value = '商品已成功移除';
    await fetchCartItems(); // Refresh from server instead of local filter
  } catch (error) {
    errorMessage.value = `移除失败: ${error.response?.data?.message || error.message}`;
  } finally {
      setTimeout(() => { successMessage.value = '' }, 3000);
  }
};

const confirmClearCart = () => {
  if (window.confirm('您确定要清空购物车中的所有商品吗？')) {
    clearCart();
  }
};

const clearCart = async () => {
  try {
    await axios.delete('/api/cart/clear');
    successMessage.value = '购物车已清空';
    await fetchCartItems(); // Refresh from server
  } catch (error) {
    errorMessage.value = `清空失败: ${error.response?.data?.message || error.message}`;
  } finally {
      setTimeout(() => { successMessage.value = '' }, 3000);
  }
};


// --- Computed Properties ---

const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

const totalAmount = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0);
});


// --- Helper Functions ---

const getItemImageUrl = (imagePath) => {
  // Assuming a standard uploads path configured in main.js or vite.config.js
  return imagePath ? `http://localhost:3000${imagePath}` : '/placeholder.png';
};

const formatFlavors = (flavors) => {
  if (!Array.isArray(flavors) || flavors.length === 0) return '标准';
  return flavors.map(f => f.value).join(', ');
};

</script>

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}

.quantity-btn-cart {
  @apply px-3 py-1 text-lg font-medium text-gray-500 bg-transparent hover:bg-gray-100 transition-colors focus:outline-none h-full;
}

.quantity-btn-cart:first-child {
  @apply rounded-l-full border-r border-gray-200;
}
.quantity-btn-cart:last-child {
  @apply rounded-r-full border-l border-gray-200;
}

.btn-primary-cart {
    @apply block w-full sm:w-auto text-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105;
}
.btn-secondary-cart {
    @apply block w-full sm:w-auto text-center px-8 py-3 bg-white text-gray-800 font-bold rounded-lg shadow-md hover:shadow-lg border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 transition-all duration-300 transform hover:scale-105;
}
</style> 