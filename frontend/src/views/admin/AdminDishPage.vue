<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6 text-slate-700">菜品管理</h1>

    <div class="mb-6">
      <button @click="openAddModal" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        添加新菜品
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading && !dishes.length" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="ml-3 text-lg font-medium text-slate-600">加载菜品数据中...</p>
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

    <!-- Dishes Table -->
    <div v-if="!isLoading || dishes.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">图片</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">名称</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">分类</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">食堂</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">价格</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">口味</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="dish in dishes" :key="dish.id" class="hover:bg-slate-50 transition-colors duration-150">
            <td class="px-4 py-3 whitespace-nowrap">
              <img :src="getImageUrl(dish.image_url)" :alt="dish.name" class="h-12 w-12 rounded-md object-cover shadow-sm" v-if="dish.image_url"/>
              <span v-else class="text-xs text-slate-400 italic">无图</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{{ dish.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{{ getCategoryName(dish.category_id) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{{ dish.canteen_name || 'N/A' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">¥{{ dish.price.toFixed(2) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
              <div v-if="dish.flavors && dish.flavors.length > 0" class="flex flex-wrap gap-1.5">
                <span v-for="flavor in dish.flavors" :key="flavor" class="px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded-full">{{ flavor }}</span>
              </div>
              <span v-else class="text-xs text-slate-400 italic">无</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="dish.is_available ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ dish.is_available ? '在售' : '停售' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button @click="openEditModal(dish)" class="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 p-1 rounded-md inline-flex items-center" title="编辑">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>编辑
              </button>
              <button @click="toggleAvailability(dish)" :class="dish.is_available ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'" class="transition-colors duration-150 p-1 rounded-md inline-flex items-center" :title="dish.is_available ? '停售' : '上架'">
                <svg v-if="dish.is_available" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                </svg>
                {{ dish.is_available ? '停售' : '上架' }}
              </button>
              <button @click="confirmDeleteDish(dish.id)" class="text-red-600 hover:text-red-800 transition-colors duration-150 p-1 rounded-md inline-flex items-center" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!isLoading && dishes.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p class="mt-3 text-xl font-medium text-slate-500">暂无菜品信息</p>
      <p class="mt-1 text-sm text-slate-400">您可以点击"添加新菜品"按钮来创建您的第一个菜品。</p>
    </div>

    <!-- Add/Edit Dish Modal -->
    <div v-if="showModal" class="fixed z-20 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="handleSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-slate-900">{{ isEditing ? '编辑菜品' : '添加新菜品' }}</h3>
                  <div class="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                      <label for="dishName" class="block text-sm font-medium text-slate-700">名称 <span class="text-red-500">*</span></label>
                      <input type="text" v-model="currentDish.name" id="dishName" required class="mt-1 input-field" placeholder="例如：宫保鸡丁"/>
                    </div>
                    <div class="sm:col-span-1">
                      <label for="dishPrice" class="block text-sm font-medium text-slate-700">价格 <span class="text-red-500">*</span></label>
                      <input type="number" v-model.number="currentDish.price" id="dishPrice" required min="0" step="0.5" class="mt-1 input-field" placeholder="例如：15.00"/>
                    </div>
                    <div class="sm:col-span-2">
                      <label for="dishDescription" class="block text-sm font-medium text-slate-700">描述</label>
                      <textarea v-model="currentDish.description" id="dishDescription" rows="3" class="mt-1 input-field" placeholder="可选，介绍菜品特色"></textarea>
                    </div>
                    <div class="sm:col-span-1">
                      <label for="dishCategory" class="block text-sm font-medium text-slate-700">分类 <span class="text-red-500">*</span></label>
                      <select v-model="currentDish.category_id" id="dishCategory" required class="mt-1 input-field">
                        <option disabled value="">请选择分类</option>
                        <option v-for="cat in selectableCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                      </select>
                    </div>
                    <div class="sm:col-span-1">
                      <label for="dishCanteen" class="block text-sm font-medium text-slate-700">食堂 <span class="text-red-500">*</span></label>
                      <select v-model="currentDish.canteen_id" id="dishCanteen" required class="mt-1 input-field">
                        <option disabled value="">请选择食堂</option>
                        <option v-for="canteen in availableCanteens" :key="canteen.id" :value="canteen.id">{{ canteen.name }}</option>
                      </select>
                    </div>
                     <div class="sm:col-span-2">
                      <label for="dishFlavors" class="block text-sm font-medium text-slate-700">口味 (逗号分隔)</label>
                      <input type="text" v-model="flavorsInput" id="dishFlavors" placeholder="例如: 微辣,中辣,特辣" class="mt-1 input-field"/>
                    </div>
                    <div class="sm:col-span-2">
                      <label for="dishImage" class="block text-sm font-medium text-slate-700">图片</label>
                      <input type="file" @change="handleImageUpload" id="dishImage" accept="image/*" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"/>
                      <div class="mt-2">
                        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="图片预览" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                        <img v-else-if="isEditing && currentDish.image_url" :src="getImageUrl(currentDish.image_url)" alt="当前图片" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                        <p v-if="isEditing && currentDish.image_url && !imagePreviewUrl" class="text-xs text-slate-500 mt-1">当前图片。选择新文件可替换。</p>
                        <p v-if="!imagePreviewUrl && !(isEditing && currentDish.image_url)" class="text-xs text-slate-400 italic">未选择图片</p>
                      </div>
                    </div>
                     <div class="sm:col-span-2 flex items-center">
                       <input id="dishAvailable" type="checkbox" v-model="currentDish.is_available" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded">
                       <label for="dishAvailable" class="ml-2 block text-sm font-medium text-slate-700">菜品在售 (上架)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {{ isSubmitting ? '处理中...' : (isEditing ? '保存更改' : '创建菜品') }}
              </button>
              <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3000'; // Base URL for images, ensure it points to the root where 'uploads' is served

const dishes = ref([]);
const allCategories = ref([]);
const allCanteens = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false); // For modal submission
const errorMessage = ref('');
const successMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentDish = ref({
  id: null,
  name: '',
  description: '',
  price: null,
  category_id: '',
  flavors: [],
  image_url: null,
  is_available: true,
  canteen_id: '',
});
const selectedImageFile = ref(null);
const imagePreviewUrl = ref(null);

// 管理端口味输入校验：自动用逗号分割，防止录入"微辣，中辣"变成一个整体
const flavorsInput = computed({
  get: () => currentDish.value.flavors ? currentDish.value.flavors.join(', ') : '',
  set: (val) => {
    // 只允许逗号分割，自动替换其他分隔符为英文逗号
    if (typeof val === 'string') {
      // 替换中文逗号、分号、顿号、句号为空格或英文逗号
      val = val.replace(/[，;；、。\.]/g, ',');
    }
    // 检查是否有连续逗号，去除多余空格
    currentDish.value.flavors = val.split(',').map(s => s.trim()).filter(s => s);
  }
});

const selectableCategories = computed(() => {
  return allCategories.value.filter(c => c.is_enabled);
});

const availableCanteens = computed(() => {
    return allCanteens.value.filter(c => c.is_enabled);
});

const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${UPLOADS_BASE_URL}${imagePath}`;
};

const fetchInitialData = async () => {
  isLoading.value = true;
  clearMessages();
  try {
    const [categoriesRes, canteensRes, dishesRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/categories/admin/all`),
      axios.get(`${API_BASE_URL}/config/canteens`),
      axios.get(`${API_BASE_URL}/dishes/admin/all`)
    ]);

    if (categoriesRes.data && categoriesRes.data.code === 0) {
      allCategories.value = categoriesRes.data.data;
    } else {
      errorMessage.value = categoriesRes.data.message || '获取分类失败';
    }

    // Handle canteens response (might be direct array or {code, data})
    if (canteensRes.data && (canteensRes.data.code === 0 || Array.isArray(canteensRes.data))) {
      allCanteens.value = Array.isArray(canteensRes.data) ? canteensRes.data : canteensRes.data.data;
    } else {
      errorMessage.value = (canteensRes.data && canteensRes.data.message) || '获取食堂列表失败';
    }

    if (dishesRes.data && dishesRes.data.code === 0) {
      dishes.value = dishesRes.data.data.map(dish => ({
        ...dish,
        // Ensure flavors is an array, even if it's null/undefined or empty string from backend
        flavors: dish.flavors ? (typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors) : []
      }));
    } else {
      errorMessage.value = dishesRes.data.message || '获取菜品列表失败';
    }

  } catch (error) {
    console.error('Error fetching initial data for dishes page:', error);
    errorMessage.value = error.response?.data?.message || error.message || '加载页面数据失败，请检查网络连接并重试。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInitialData);

const getCategoryName = (categoryId) => {
  const category = allCategories.value.find(c => c.id === categoryId);
  return category ? category.name : '未知分类';
};

const openAddModal = () => {
  clearMessages();
  isEditing.value = false;
  currentDish.value = {
    id: null, name: '', description: '', price: null, category_id: '',
    flavors: [], image_url: null, is_available: true, canteen_id: ''
  };
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  showModal.value = true;
};

const openEditModal = (dish) => {
  clearMessages();
  isEditing.value = true;
  currentDish.value = { 
    ...dish, 
    // Ensure flavors are an array for the modal, even if stored as JSON string
    flavors: Array.isArray(dish.flavors) ? dish.flavors : (dish.flavors ? JSON.parse(dish.flavors) : [])
  };
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImageFile.value = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
    currentDish.value.image_url = null; // Clear existing image_url if a new file is selected
  } else {
    selectedImageFile.value = null;
    imagePreviewUrl.value = null;
    // if editing, and user deselects, should we revert to original currentDish.image_url? 
    // For now, let's assume if they clear it, they want no image or to keep existing if not changed
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  clearMessages();

  const formData = new FormData();
  Object.keys(currentDish.value).forEach(key => {
    if (key === 'flavors' && Array.isArray(currentDish.value.flavors)) {
      // Send flavors as a JSON string array
      formData.append(key, JSON.stringify(currentDish.value.flavors));
    } else if (currentDish.value[key] !== null) {
      formData.append(key, currentDish.value[key]);
    }
  });

  if (selectedImageFile.value) {
    formData.append('image', selectedImageFile.value);
  }

  try {
    const url = isEditing.value
      ? `${API_BASE_URL}/dishes/admin/${currentDish.value.id}`
      : `${API_BASE_URL}/dishes/admin`;
    
    const method = isEditing.value ? 'put' : 'post';

    const response = await axios({
      method,
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    handleApiSuccess(response, isEditing.value ? '菜品更新成功！' : '菜品添加成功！');
    closeModal();
    await fetchInitialData();
  } catch (error) {
    handleApiError(error, '操作失败');
  } finally {
    isSubmitting.value = false;
  }
};

const handleApiSuccess = (response, successMsg) => {
  if (response.data && response.data.code === 0) {
    successMessage.value = successMsg;
    setTimeout(() => { successMessage.value = '' }, 3000);
  } else {
    throw new Error(response.data.message || '操作失败');
  }
};

const handleApiError = (error, defaultMsg) => {
  console.error('API Error:', error);
  errorMessage.value = error.response?.data?.message || error.message || defaultMsg;
  setTimeout(() => { errorMessage.value = '' }, 5000);
};

const toggleAvailability = async (dish) => {
  clearMessages();
  const originalStatus = dish.is_available;

  // Optimistic UI Update
  const dishIndex = dishes.value.findIndex(d => d.id === dish.id);
  if (dishIndex !== -1) {
    dishes.value[dishIndex].is_available = !originalStatus;
  }

  const updatedDish = { ...dish, is_available: !originalStatus };

  try {
    const response = await axios.put(`${API_BASE_URL}/dishes/admin/${dish.id}`, updatedDish, {
      headers: { 'Content-Type': 'application/json' },
    });
    handleApiSuccess(response, `菜品 "${dish.name}" 状态已更新。`);
    // On success, we can optionally refetch to ensure perfect sync, but optimistic update handles the UI.
    // await fetchInitialData(); 
  } catch (error) {
    // Revert UI on error
    if (dishIndex !== -1) {
      dishes.value[dishIndex].is_available = originalStatus;
    }
    handleApiError(error, `无法更新菜品 "${dish.name}" 的状态。`);
  }
};

const confirmDeleteDish = async (dishId) => {
  clearMessages();
  if (window.confirm('确定要删除这个菜品吗？此操作无法撤销。')) {
    isSubmitting.value = true; // Use isSubmitting to indicate general async operation
    try {
      const response = await axios.delete(`${API_BASE_URL}/dishes/admin/${dishId}`);
      handleApiSuccess(response, '菜品删除成功！');
      await fetchInitialData(); // Refresh list
    } catch (error) {
      handleApiError(error, '删除失败');
    } finally {
      isSubmitting.value = false;
    }
  }
};

</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400;
}
/* Ensure this class is defined or remove if not used elsewhere */
/* .btn-primary, .btn-secondary might have been from a global style or previous version. Ensure they are defined or use direct Tailwind classes. */
</style>