<template>
  <div class="flex flex-col md:flex-row flex-1">
    <!-- Sidebar (Categories & Canteens) -->
    <aside class="w-full md:w-72 bg-white p-4 md:p-6 shadow-lg md:shadow-none md:border-r border-gray-200 rounded-lg md:rounded-none mb-4 md:mb-0">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">筛选</h2>
      
      <!-- Canteen Filter -->
      <div class="mb-6">
        <h3 class="text-md font-semibold mb-2 text-gray-600">选择食堂</h3>
        <div v-if="isLoadingCanteens" class="text-sm text-gray-500">加载食堂...</div>
        <ul v-else class="space-y-1">
          <li>
            <button 
              @click="selectCanteen(null)" 
              :class="['filter-button', { 'filter-button-active': selectedCanteenId === null }]"
            >
              所有食堂
            </button>
          </li>
          <li v-for="canteen in canteens" :key="canteen.id">
            <button 
              @click="selectCanteen(canteen.id)" 
              :class="['filter-button', { 'filter-button-active': selectedCanteenId === canteen.id }]"
            >
              {{ canteen.name }}
            </button>
          </li>
          <li v-if="!isLoadingCanteens && canteens.length === 0" class="text-sm text-gray-500">
            暂无食堂可选
          </li>
        </ul>
      </div>

      <!-- Category Filter -->
      <div>
        <h3 class="text-md font-semibold mb-2 text-gray-600">菜品分类</h3>
        <div v-if="isLoadingCategories" class="text-sm text-gray-500">加载分类...</div>
        <ul v-else class="space-y-1">
          <li>
            <button 
              @click="selectCategory(null)" 
              :class="['filter-button', { 'filter-button-active': selectedCategoryId === null }]"
            >
              全部分类
            </button>
          </li>
          <li v-for="category in categories" :key="category.id">
            <button 
              @click="selectCategory(category.id)" 
              :class="['filter-button', { 'filter-button-active': selectedCategoryId === category.id }]"
            >
              {{ category.name }}
            </button>
          </li>
          <li v-if="!isLoadingCategories && categories.length === 0" class="text-sm text-gray-500">
              暂无分类
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main Content: Menu Items -->
    <main class="flex-1 md:p-6">
      <h1 class="text-2xl md:text-3xl font-bold mb-6 text-gray-800 pl-4 md:pl-0 pt-4 md:pt-0">功夫宅急送 - 菜单</h1>
      
      <!-- Loading/Error Messages -->
      <div v-if="isLoadingItems" class="text-center py-10"><p class="text-lg text-gray-600">加载菜品和套餐中...</p></div>
      <div v-if="itemErrorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
        <p class="font-bold">加载错误</p>
        <p>{{ itemErrorMessage }}</p>
      </div>

      <!-- Dishes Section -->
      <section v-if="filteredDishes.length > 0">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">特色菜品</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="dish in filteredDishes" :key="dish.id" class="menu-item-card">
            <img :src="getItemImageUrl(dish.image_url, 'dishes')" :alt="dish.name" class="w-full h-48 object-cover rounded-t-lg" v-if="dish.image_url"/>
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-lg">无图</div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ dish.name }}</h3>
              <p class="text-xs text-purple-600 font-medium mb-1" v-if="dish.canteen_name">{{ dish.canteen_name }}</p>
              <p class="text-sm text-gray-600 mb-2 h-10 overflow-hidden">{{ dish.description || '暂无描述' }}</p>
              <p class="text-sm text-gray-500 mb-1" v-if="dish.flavors && dish.flavors.length > 0">可选口味: {{ dish.flavors.join(', ') }}</p>
              <div class="flex justify-between items-center mt-3">
                <p class="text-xl font-bold text-red-600">¥{{ dish.price.toFixed(2) }}</p>
                <button @click="addToCart(dish, 'dish')" class="btn-add-to-cart">加入购物车</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Combos Section (Displayed if no category selected or if combos are general) -->
       <section v-if="selectedCategoryId === null && filteredCombos.length > 0" class="mt-10">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">优惠套餐</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="combo in filteredCombos" :key="combo.id" class="menu-item-card">
            <img :src="getItemImageUrl(combo.image_url, 'combos')" :alt="combo.name" class="w-full h-48 object-cover rounded-t-lg" v-if="combo.image_url"/>
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-lg">无图</div>
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ combo.name }}</h3>
              <p class="text-sm text-gray-600 mb-2 h-10 overflow-hidden">{{ combo.description || '暂无描述' }}</p>
              <!-- Combo items list -->
              <div class="text-xs text-gray-500 mb-2">
                包含: 
                <span v-for="(item, index) in combo.dishes" :key="item.dish_id">
                  {{ getDishNameForCombo(item.dish_id) }} x{{ item.quantity }}{{ index < combo.dishes.length - 1 ? ', ' : '' }}
                </span>
              </div>
              <div class="flex justify-between items-center mt-3">
                <p class="text-xl font-bold text-red-600">¥{{ combo.price.toFixed(2) }}</p>
                <button @click="addToCart(combo, 'combo')" class="btn-add-to-cart">加入购物车</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div v-if="!isLoadingItems && filteredDishes.length === 0 && (selectedCategoryId !== null || filteredCombos.length === 0)" class="text-center py-10">
        <p class="text-lg text-gray-500">该分类下暂无菜品，或暂无任何项目。</p>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

const categories = ref([]);
const allDishes = ref([]); // Store all fetched dishes
const allCombos = ref([]); // Store all fetched combos
const canteens = ref([]); // Store all fetched canteens

const isLoadingCategories = ref(false);
const isLoadingCanteens = ref(false); // Loading state for canteens
const isLoadingItems = ref(false); // Combined loading for dishes and combos
const itemErrorMessage = ref('');

const selectedCategoryId = ref(null); // null means all
const selectedCanteenId = ref(null); // null means all canteens

const getItemImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  return imagePath.startsWith('http') ? imagePath : `http://localhost:3000${imagePath}`;
};

const fetchCategories = async () => {
  isLoadingCategories.value = true;
  try {
    const response = await axios.get('/api/categories');
    if (response.data && response.data.code === 0) {
      categories.value = response.data.data;
    } else {
      console.error('Failed to load categories:', response.data.message);
      categories.value = [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    categories.value = [];
  } finally {
    isLoadingCategories.value = false;
  }
};

const fetchCanteens = async () => {
  isLoadingCanteens.value = true;
  try {
    const response = await axios.get('/api/config/canteens');
    if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
        canteens.value = response.data.data.filter(c => c.is_enabled);
    } else {
        console.error('Failed to load canteens:', response.data?.message || 'Unexpected response structure');
        canteens.value = [];
    }
  } catch (error) {
    console.error('Error fetching canteens:', error);
    canteens.value = [];
  } finally {
    isLoadingCanteens.value = false;
  }
};

const fetchAllMenuItems = async () => {
  isLoadingItems.value = true;
  itemErrorMessage.value = '';
  try {
    const dishParams = {};
    if (selectedCanteenId.value) {
      dishParams.canteenId = selectedCanteenId.value;
    }

    const [dishesResponse, combosResponse] = await Promise.all([
      axios.get('/api/dishes', { params: dishParams }),
      axios.get('/api/combos')
    ]);

    if (dishesResponse.data && dishesResponse.data.code === 0) {
      allDishes.value = dishesResponse.data.data.map(dish => ({
        ...dish,
        flavors: Array.isArray(dish.flavors) ? dish.flavors : []
      }));
    } else {
      itemErrorMessage.value += '获取菜品列表失败. ';
    }

    if (combosResponse.data && combosResponse.data.code === 0) {
      allCombos.value = combosResponse.data.data;
    } else {
      itemErrorMessage.value += '获取套餐列表失败.';
    }

  } catch (error) {
    console.error('Error fetching menu items:', error);
    itemErrorMessage.value = '加载菜单项目时出错，请稍后再试。';
  } finally {
    isLoadingItems.value = false;
  }
};

const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
};

const selectCanteen = (canteenId) => {
  selectedCanteenId.value = canteenId;
  // When canteen changes, we need to re-fetch dishes with the new canteenId filter
  // Combos are not filtered by canteen, so no need to re-fetch them unless business logic changes
  fetchAllMenuItems(); 
};

const filteredDishes = computed(() => {
  let dishesToFilter = allDishes.value;
  // Canteen filter is now applied at fetchAllMenuItems for dishes
  // So, allDishes.value is already pre-filtered by canteen if a canteen is selected.

  if (!selectedCategoryId.value) {
    return dishesToFilter;
  }
  return dishesToFilter.filter(dish => dish.category_id === selectedCategoryId.value);
});

const filteredCombos = computed(() => {
  // For now, combos are not filtered by category. Display all available combos.
  // If category_id was part of combo data, filtering could be applied here.
  return allCombos.value;
});

// Helper to get dish name for combo display (needs allDishes to be populated)
const getDishNameForCombo = (dishId) => {
    const dish = allDishes.value.find(d => d.id === dishId);
    return dish ? dish.name : '未知菜品';
};

onMounted(() => {
  fetchCategories();
  fetchCanteens(); // Fetch canteens on mount
  fetchAllMenuItems();
});

const viewDetails = (item) => {
  if (item.type === 'dish' || item.type === 'combo') {
    router.push(`/home/dish/${item.id}`);
  }
};

const addToCart = async (item, type) => {
  // If a dish has flavors, navigate to its detail page for flavor selection.
  if (type === 'dish' && item.flavors && item.flavors.length > 0) {
    router.push(`/home/dish/${item.id}`);
    return;
  }

  // For combos or dishes without flavors, add directly to the cart.
  const payload = {
    item_id: item.id,
    item_type: type,
    quantity: 1, // Default quantity
    selected_flavors: [] // No flavors for direct add
  };

  try {
    await axios.post('/api/cart', payload);
    alert(`"${item.name}" 已成功添加到购物车！`);
  } catch (error) {
    console.error(`添加到购物车失败 (${item.name}):`, error);
    alert(`添加 "${item.name}" 失败: ${error.response?.data?.message || error.message}`);
  }
};

</script>

<style scoped>
.category-button, .filter-button {
  @apply w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors;
}
.category-button-active, .filter-button-active {
  @apply bg-blue-500 text-white hover:bg-blue-600 hover:text-white;
}

.menu-item-card {
  @apply bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col;
}

.btn-add-to-cart {
    @apply mt-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50;
}

/* Ensure consistent height for description to prevent layout jumps */
.h-10 {
  height: 2.5rem; /* Adjust as needed for 2 lines of text with your font size */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 