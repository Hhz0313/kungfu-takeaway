<template>
  <div class="container mx-auto p-4 md:p-8 max-w-4xl">
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-xl font-semibold text-blue-500">加载菜品详情...</p>
      <!-- Basic spinner -->
      <div class="mt-4 inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div v-else-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-md" role="alert">
      <h2 class="font-bold text-lg mb-2">加载错误</h2>
      <p>{{ errorMessage }}</p>
      <router-link to="/home/menu" class="mt-4 inline-block text-blue-600 hover:underline">返回菜单</router-link>
    </div>

    <div v-else-if="dish" class="bg-white shadow-xl rounded-lg overflow-hidden">
      <div class="md:flex">
        <!-- Image Section -->
        <div class="md:w-1/2">
          <img 
            :src="getItemImageUrl(dish.image_url)" 
            :alt="dish.name" 
            class="w-full h-64 md:h-full object-cover"
            v-if="dish.image_url"
          />
          <div v-else class="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
        </div>

        <!-- Details Section -->
        <div class="md:w-1/2 p-6 md:p-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{{ dish.name }}</h1>
          <p v-if="dish.canteen_name" class="text-md text-purple-600 font-semibold mb-2">[{{ dish.canteen_name }}]</p>
          <p class="text-gray-600 mb-4 leading-relaxed">{{ dish.description || '暂无详细描述。' }}</p>
          
          <div class="mb-6">
            <span class="text-3xl font-bold text-red-600">¥{{ dish.price.toFixed(2) }}</span>
            <span v-if="!dish.is_available" class="ml-4 px-3 py-1 text-sm font-semibold bg-yellow-200 text-yellow-800 rounded-full">已停售</span>
          </div>

          <!-- Flavor Selection -->
          <div v-if="Array.isArray(dish.flavors) && dish.flavors.length > 0 && dish.is_available" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">选择口味:</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="flavor in dish.flavors"
                :key="flavor"
                @click="() => selectFlavor(flavor)"
                :class="[
                  'px-4 py-2 border rounded-md text-sm font-medium transition-colors',
                  selectedFlavor === flavor ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                ]"
                type="button"
              >
                {{ flavor }}
              </button>
            </div>
          </div>

          <!-- Quantity Selection -->
          <div v-if="dish.is_available" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-2">选择数量:</h3>
            <div class="flex items-center">
              <button @click="decrementQuantity" class="quantity-btn">-</button>
              <input type="number" v-model.number="quantity" readonly class="quantity-input" />
              <button @click="incrementQuantity" class="quantity-btn">+</button>
            </div>
          </div>
          
          <!-- Add to Cart Button -->
          <div v-if="dish.is_available">
            <button 
              @click="handleAddToCart"
              class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50"
              :disabled="isAddingToCart || (Array.isArray(dish.flavors) && dish.flavors.length > 0 && !selectedFlavor)"
            >
              {{ isAddingToCart ? '添加中...' : '加入购物车' }}
            </button>
            <p v-if="Array.isArray(dish.flavors) && dish.flavors.length > 0 && !selectedFlavor && !isAddingToCart" class="text-red-500 text-sm mt-2">请选择口味</p>
          </div>

          <div v-if="cartMessage" :class="cartMessageType === 'success' ? 'text-green-600' : 'text-red-600'" class="mt-4 text-sm">
            {{ cartMessage }}
          </div>

          <div class="mt-8">
            <router-link :to="{ name: 'MenuPage' }" class="text-blue-600 hover:text-blue-800 hover:underline">&larr; 返回菜单</router-link>
            <router-link v-if="cartMessageType === 'success'" to="/home/cart" class="ml-4 text-green-600 hover:text-green-800 hover:underline font-semibold">去购物车 &rarr;</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback/Error -->
    <template v-else>
      <div class="text-center py-20">
        <p class="text-xl text-gray-700 mb-4">无法加载菜品信息。</p>
        <router-link to="/home/menu" class="mt-4 inline-block text-blue-600 hover:underline">返回菜单</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const UPLOADS_BASE_URL = 'http://localhost:3000/uploads/';

const route = useRoute();
const router = useRouter();

const dishId = computed(() => route.params.id);
const dish = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');

const selectedFlavor = ref(null);
const quantity = ref(1);

const isAddingToCart = ref(false);
const cartMessage = ref('');
const cartMessageType = ref(''); // 'success' or 'error'

const getItemImageUrl = (imagePath) => {
  if (!imagePath) return ''; 
  const folder = 'dishes/'; // Assuming this page is only for dishes
  const imageName = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  return `${UPLOADS_BASE_URL}${folder}${imageName}`;
};

const fetchDishDetails = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  cartMessage.value = '';
  selectedFlavor.value = null; // 重置口味选择
  
  try {
    const response = await axios.get(`${API_BASE_URL}/dishes/${dishId.value}`);
    console.log('API响应:', response.data);
    
    if (response.data && response.data.code === 0) {
      const fetchedDish = response.data.data;
      console.log('获取到的菜品数据:', fetchedDish);
      
      // 确保 flavors 是数组
      if (!Array.isArray(fetchedDish.flavors)) {
        console.warn('flavors 不是数组，设置为空数组');
        fetchedDish.flavors = [];
      }
      
      dish.value = fetchedDish;
      
      // 如果只有一个口味，自动选择
      if (fetchedDish.flavors.length === 1) {
        selectedFlavor.value = fetchedDish.flavors[0];
        console.log('自动选择口味:', selectedFlavor.value);
      }
    } else {
      throw new Error(response.data.message || '获取菜品详情失败');
    }
  } catch (error) {
    console.error('获取菜品详情失败:', error);
    errorMessage.value = error.response?.data?.message || error.message || '无法加载菜品信息，请稍后再试。';
    if (error.response?.status === 404) {
      errorMessage.value = `菜品 (ID: ${dishId.value}) 未找到。`;
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDishDetails();
});

const incrementQuantity = () => { quantity.value++; };
const decrementQuantity = () => { 
  if (quantity.value > 1) quantity.value--; 
};

// 修改口味选择函数
const selectFlavor = (flavor) => {
  console.log('选择口味:', flavor);
  selectedFlavor.value = flavor;
};

const handleAddToCart = async () => {
  if (!dish.value) return;

  // Validate that a flavor is selected if flavors are available
  if (dish.value.flavors && dish.value.flavors.length > 0 && !selectedFlavor.value) {
      cartMessage.value = '请先选择一个口味';
      cartMessageType.value = 'error';
      setTimeout(() => { cartMessage.value = '' }, 3000);
      return;
  }

  isAddingToCart.value = true;
  cartMessage.value = '';

  const payload = {
    item_id: dish.value.id,
    item_type: 'dish',
    quantity: quantity.value,
    // Use the correct variable 'selectedFlavor' and format it as the backend expects: an array of objects.
    // Since there's only one flavor selection, the array will have one item.
    selected_flavors: selectedFlavor.value ? [{ name: dish.value.flavor_name || '口味', value: selectedFlavor.value }] : []
  };

  try {
    const response = await axios.post('/api/cart', payload);
    console.log('API响应:', response.data);
    
    if (response.data && response.data.code === 0) {
      const addedItem = response.data.data;
      console.log('添加到购物车的菜品数据:', addedItem);
      
      cartMessage.value = `"${addedItem.name}" 已成功添加到购物车！`;
      cartMessageType.value = 'success';
      
      // Optionally redirect or update UI
      setTimeout(() => {
        cartMessage.value = '';
      }, 3000);
    } else {
      // Handle cases where item is added but maybe with a notice
      cartMessage.value = response.data.message || '已添加到购物车';
      cartMessageType.value = 'success';
    }
  } catch (err) {
    console.error('添加到购物车失败:', err);
    cartMessage.value = err.response?.data?.message || '添加失败，请稍后重试';
    cartMessageType.value = 'error';
  } finally {
    isAddingToCart.value = false;
  }
};

</script>

<style scoped>
.quantity-btn {
  @apply bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400;
}
.quantity-input {
  @apply w-16 text-center border-t border-b border-gray-300 py-2 px-0 mx-2 font-semibold text-gray-700 focus:outline-none;
  /* Hide spinner buttons for number input */
  -moz-appearance: textfield; /* Firefox */
}
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>