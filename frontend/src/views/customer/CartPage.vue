<template>
  <div class="container mx-auto p-4 md:p-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">我的购物车</h1>

    <div v-if="isLoading" class="text-center py-12">
      <p class="text-xl font-semibold text-blue-500">加载购物车信息...</p>
      <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md mb-6" role="alert">
      <h2 class="font-bold text-lg mb-2">错误</h2>
      <p>{{ errorMessage }}</p>
    </div>
    
    <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow-md" role="alert">
        <p>{{ successMessage }}</p>
    </div>

    <div v-if="!isLoading && cartItems.length === 0 && !errorMessage">
      <div class="text-center py-12 bg-white shadow-md rounded-lg">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="mt-6 text-xl font-semibold text-gray-700">您的购物车是空的</p>
        <p class="mt-2 text-gray-500">看起来您还没有添加任何商品。</p>
        <router-link to="/menu" class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors">
          去逛逛
        </router-link>
      </div>
    </div>

    <div v-if="!isLoading && cartItems.length > 0">
      <!-- Cart Items List -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden divide-y divide-gray-200">
        <div v-for="item in cartItems" :key="item.id" class="p-4 flex flex-col md:flex-row items-center gap-4">
          <img :src="getItemImageUrl(item.item_image_url, item.item_type)" :alt="item.name" class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-md border border-gray-200">
          
          <div class="flex-grow text-center md:text-left">
            <h2 class="text-lg font-semibold text-gray-800">{{ item.name }}</h2>
            <p class="text-sm text-gray-500">{{ item.item_type === 'dish' ? '菜品' : '套餐' }}</p>
            <p v-if="item.selected_flavors && item.selected_flavors.length > 0" class="text-sm text-gray-600">
              口味: {{ formatFlavors(item.selected_flavors) }}
            </p>
          </div>

          <div class="flex items-center gap-3 md:gap-4 text-center">
            <p class="text-md text-gray-700 w-20">¥{{ item.price_at_addition.toFixed(2) }}</p>
            
            <div class="flex items-center border border-gray-300 rounded-md">
              <button @click="updateItemQuantity(item, item.quantity - 1)" class="quantity-btn-cart">-</button>
              <span class="px-3 py-1 text-sm font-medium text-gray-700 w-10 text-center">{{ item.quantity }}</span>
              <button @click="updateItemQuantity(item, item.quantity + 1)" class="quantity-btn-cart">+</button>
            </div>
            
            <p class="text-md font-semibold text-red-600 w-24">¥{{ (item.price_at_addition * item.quantity).toFixed(2) }}</p>

            <button @click="removeItem(item.id)" title="移除商品" class="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary and Actions -->
      <div class="mt-8 p-6 bg-white shadow-md rounded-lg flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <button @click="confirmClearCart" class="text-sm text-red-500 hover:text-red-700 hover:underline focus:outline-none">
            清空购物车
          </button>
        </div>
        <div class="text-center md:text-right">
          <p class="text-lg text-gray-700">
            共 <span class="font-semibold text-blue-600">{{ cartItemCount }}</span> 件商品，总计: 
            <span class="text-2xl font-bold text-red-600">¥{{ totalAmount.toFixed(2) }}</span>
          </p>
          <div class="mt-4 flex flex-col sm:flex-row gap-3 justify-center md:justify-end">
            <router-link to="/menu" class="btn-secondary-cart">
              继续购物
            </router-link>
            <router-link to="/checkout" class="btn-primary-cart">
              去结算
            </router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const UPLOADS_BASE_URL = 'http://localhost:3000/uploads/';
const DUMMY_USER_ID = "1"; // Replace with actual user ID management later

const router = useRouter();

const cartItems = ref([]);
const totalAmount = ref(0);
const isLoading = ref(true);
const errorMessage = ref('');
const successMessage = ref(''); // For general success messages like "Cart cleared"

const clearMessages = () => {
    errorMessage.value = '';
    successMessage.value = '';
};

const fetchCart = async () => {
  console.log('[CartPage] fetchCart: Setting isLoading = true');
  isLoading.value = true;
  clearMessages();
  try {
    console.log('[CartPage] fetchCart: Attempting API call...');
    const response = await axios.get(`${API_BASE_URL}/cart?user_id=${DUMMY_USER_ID}`);
    console.log('[CartPage] fetchCart: API call completed. Response status:', response.status);

    if (response.data && response.data.code === 0) {
      console.log('[CartPage] fetchCart: API success, processing data...');
      cartItems.value = response.data.data.items.map(item => ({
        ...item,
        selected_flavors: Array.isArray(item.selected_flavors) ? item.selected_flavors : [] 
      }));
      totalAmount.value = response.data.data.total_amount;
      console.log('[CartPage] fetchCart: Data processing complete.');
    } else {
      console.error('[CartPage] fetchCart: API returned error code or no data. Message:', response.data.message);
      throw new Error(response.data.message || '获取购物车信息失败');
    }
  } catch (error) {
    console.error("[CartPage] fetchCart: Caught error:", error);
    errorMessage.value = error.response?.data?.message || error.message || '无法加载购物车，请稍后再试。';
    cartItems.value = []; // Clear items on error
    totalAmount.value = 0;
  } finally {
    console.log('[CartPage] fetchCart: FINALLY block reached. Setting isLoading = false');
    isLoading.value = false;
  }
};

onMounted(fetchCart);

const getItemImageUrl = (imagePath, itemType) => {
  if (!imagePath) return '/placeholder-image.png'; // Provide a generic placeholder
  const folder = itemType === 'dish' ? 'dishes/' : 'combos/';
  const imageName = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  return `${UPLOADS_BASE_URL}${folder}${imageName}`;
};

const formatFlavors = (flavorsArray) => {
  if (!flavorsArray || flavorsArray.length === 0) return '';
  return flavorsArray.join(', ');
};

const updateItemQuantity = async (item, newQuantity) => {
  clearMessages();
  if (newQuantity < 1) {
    // If quantity is reduced to 0 or less, remove the item
    await removeItem(item.id);
    return;
  }

  try {
    const response = await axios.put(`${API_BASE_URL}/cart/update/${item.id}`, {
      user_id: DUMMY_USER_ID,
      quantity: newQuantity
    });
    if (response.data && response.data.code === 0) {
      successMessage.value = `"${item.name}"数量已更新。`;
      await fetchCart(); // Refresh entire cart
    } else {
      throw new Error(response.data.message || '更新商品数量失败');
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
    errorMessage.value = error.response?.data?.message || error.message || '更新数量失败，请重试。';
    await fetchCart(); 
  } finally {
    setTimeout(() => clearMessages(), 3000); // Re-enabled auto-clear message
  }
};

const removeItem = async (cartItemId) => {
  clearMessages();
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/remove/${cartItemId}`, {
      data: { user_id: DUMMY_USER_ID } // Axios DELETE with body needs 'data' property
    });
    if (response.data && response.data.code === 0) {
      successMessage.value = '商品已从购物车移除。';
      await fetchCart(); // Refresh cart
    } else {
      throw new Error(response.data.message || '移除商品失败');
    }
  } catch (error) {
    console.error('Error removing item:', error);
    errorMessage.value = error.response?.data?.message || error.message || '移除商品失败，请重试。';
    await fetchCart();
  } finally {
    setTimeout(() => clearMessages(), 3000); // Re-enabled auto-clear message
  }
};

const confirmClearCart = () => {
    if(window.confirm('确定要清空购物车中的所有商品吗？')) {
        clearCart();
    }
};

const clearCart = async () => {
  clearMessages();
  try {
    const response = await axios.post(`${API_BASE_URL}/cart/clear`, { user_id: DUMMY_USER_ID });
    if (response.data && response.data.code === 0) {
      successMessage.value = '购物车已清空。';
      await fetchCart(); // Refresh cart (should be empty)
    } else {
      throw new Error(response.data.message || '清空购物车失败');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    errorMessage.value = error.response?.data?.message || error.message || '清空购物车失败，请重试。';
    await fetchCart();
  } finally {
    setTimeout(() => clearMessages(), 3000); // Re-enabled auto-clear message
  }
};

const cartItemCount = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
});

</script>

<style scoped>
.quantity-btn-cart {
  @apply px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300;
}

.btn-primary-cart {
    @apply block w-full sm:w-auto text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50;
}
.btn-secondary-cart {
    @apply block w-full sm:w-auto text-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50;
}
</style> 