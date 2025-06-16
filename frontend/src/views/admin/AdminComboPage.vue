<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-6 text-slate-700">套餐管理</h1>

    <div class="mb-6">
      <button @click="openAddModal" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        添加新套餐
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading && !combos.length" class="flex justify-center items-center py-10">
       <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="ml-3 text-lg font-medium text-slate-600">加载套餐数据中...</p>
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

    <!-- Combos Table -->
    <div v-if="!isLoading || combos.length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">图片</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">名称</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">价格</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">包含菜品</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="combo in combos" :key="combo.id" class="hover:bg-slate-50 transition-colors duration-150">
            <td class="px-4 py-3 whitespace-nowrap">
              <img :src="getImageUrl(combo.image_url)" :alt="combo.name" class="h-12 w-12 rounded-md object-cover shadow-sm" v-if="combo.image_url"/>
              <span v-else class="text-xs text-slate-400 italic">无图</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{{ combo.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">¥{{ combo.price.toFixed(2) }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
              <ul v-if="combo.dishes && combo.dishes.length > 0" class="list-disc list-inside text-xs space-y-0.5">
                <li v-for="dishItem in combo.dishes" :key="dishItem.dish_id">
                  {{ getDishName(dishItem.dish_id) }} <span class="text-slate-500">x {{ dishItem.quantity }}</span>
                </li>
              </ul>
              <span v-else class="text-xs text-slate-400 italic">无</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span :class="combo.is_enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'" class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ combo.is_enabled ? '在售' : '停售' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
               <button @click="openEditModal(combo)" class="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 p-1 rounded-md inline-flex items-center" title="编辑">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                </svg>编辑
              </button>
              <button @click="toggleAvailability(combo)" :class="combo.is_enabled ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'" class="transition-colors duration-150 p-1 rounded-md inline-flex items-center" :title="combo.is_enabled ? '停售' : '上架'">
                <svg v-if="combo.is_enabled" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                </svg>
                {{ combo.is_enabled ? '停售' : '上架' }}
              </button>
              <button @click="confirmDeleteCombo(combo.id)" class="text-red-600 hover:text-red-800 transition-colors duration-150 p-1 rounded-md inline-flex items-center" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!isLoading && combos.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="mt-3 text-xl font-medium text-slate-500">暂无套餐信息</p>
      <p class="mt-1 text-sm text-slate-400">您可以点击"添加新套餐"按钮来创建您的第一个套餐。</p>
    </div>

    <!-- Add/Edit Combo Modal -->
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
                  <h3 class="text-lg leading-6 font-medium text-slate-900">{{ isEditing ? '编辑套餐' : '添加新套餐' }}</h3>
                  <div class="mt-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                      <label for="comboName" class="block text-sm font-medium text-slate-700">名称 <span class="text-red-500">*</span></label>
                      <input type="text" v-model="currentCombo.name" id="comboName" required class="input-field" placeholder="例如：单人超值套餐"/>
                    </div>
                     <div class="sm:col-span-1">
                      <label for="comboPrice" class="block text-sm font-medium text-slate-700">价格 <span class="text-red-500">*</span></label>
                      <input type="number" v-model.number="currentCombo.price" id="comboPrice" required min="0.01" step="0.01" class="input-field" placeholder="例如：25.00"/>
                    </div>
                    <div class="sm:col-span-2">
                      <label for="comboDescription" class="block text-sm font-medium text-slate-700">描述</label>
                      <textarea v-model="currentCombo.description" id="comboDescription" rows="2" class="input-field" placeholder="可选，介绍套餐内容"></textarea>
                    </div>
                    <div class="sm:col-span-2">
                      <label for="comboImage" class="block text-sm font-medium text-slate-700">图片</label>
                      <input type="file" @change="handleImageUpload" id="comboImage" accept="image/*" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"/>
                      <div class="mt-2">
                        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="图片预览" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                        <img v-else-if="isEditing && currentCombo.image_url" :src="getImageUrl(currentCombo.image_url)" alt="当前图片" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                        <p v-if="isEditing && currentCombo.image_url && !imagePreviewUrl" class="text-xs text-slate-500 mt-1">当前图片。选择新文件可替换。</p>
                        <p v-if="!imagePreviewUrl && !(isEditing && currentCombo.image_url)" class="text-xs text-slate-400 italic">未选择图片</p>
                      </div>
                    </div>

                    <!-- Dish Selection -->
                    <div class="sm:col-span-2">
                      <h4 class="block text-sm font-medium text-slate-700 mb-1">选择菜品 <span class="text-red-500">*</span></h4>
                      <div class="max-h-48 overflow-y-auto border border-slate-300 rounded-md p-3 space-y-2 bg-slate-50">
                        <div v-for="dish in selectableDishes" :key="dish.id" class="flex items-center justify-between p-2 bg-white rounded-md shadow-sm hover:bg-slate-100 transition-colors duration-150">
                          <div>
                            <span class="font-medium text-sm text-slate-800">{{ dish.name }}</span>
                            <span class="text-xs text-slate-500 ml-2">(¥{{ dish.price.toFixed(2) }})</span>
                          </div>
                          <div class="flex items-center">
                            <button type="button" @click="decrementDishInCombo(dish.id)" class="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors duration-150">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                            <span class="w-10 text-center text-sm font-medium text-slate-700">{{ getDishQuantityInCombo(dish.id) }}</span>
                            <button type="button" @click="incrementDishInCombo(dish.id)" class="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors duration-150">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                            </button>
                          </div>
                        </div>
                         <p v-if="selectableDishes.length === 0" class="text-sm text-slate-500 text-center py-3 italic">暂无可选择的在售菜品。请先添加或上架菜品。</p>
                      </div>
                       <p v-if="formErrors.dishes" class="text-xs text-red-600 mt-1">{{ formErrors.dishes }}</p>
                    </div>
                     <div class="sm:col-span-2 flex items-center mt-2">
                       <input id="comboEnabled" type="checkbox" v-model="currentCombo.is_enabled" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded">
                       <label for="comboEnabled" class="ml-2 block text-sm font-medium text-slate-700">套餐在售 (上架)</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                {{ isSubmitting ? '处理中...' : (isEditing ? '保存更改' : '创建套餐') }}
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
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || 'http://localhost:3000';

const combos = ref([]);
const allDishes = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentCombo = ref({
  id: null,
  name: '',
  description: '',
  price: null,
  image_url: null,
  is_enabled: true,
  dishes: [], // Array of { dish_id: string, quantity: number }
});
const selectedImageFile = ref(null);
const imagePreviewUrl = ref(null);
const formErrors = ref({}); // For form validation errors in the modal

const selectableDishes = computed(() => {
  if (!Array.isArray(allDishes.value)) {
    console.error('allDishes is not an array:', allDishes.value);
    return [];
  }

  console.log('Total dishes:', allDishes.value.length);
  
  const filtered = allDishes.value.filter(dish => {
    if (!dish) {
      console.warn('Found null/undefined dish');
      return false;
    }
    
    // 打印每个菜品的详细信息
    console.log(`Filtering dish "${dish.name}" (ID: ${dish.id}):`, {
      is_enabled: dish.is_enabled,
      type: typeof dish.is_enabled,
      raw_value: dish.is_enabled
    });
    
    return dish.is_enabled === true;
  });

  console.log('Filtered dishes count:', filtered.length);
  console.log('Filtered dishes:', filtered.map(d => ({
    id: d.id,
    name: d.name,
    is_enabled: d.is_enabled
  })));
  
  return filtered;
});

const clearMessagesAndErrors = () => {
  errorMessage.value = '';
  successMessage.value = '';
  formErrors.value = {};
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${UPLOADS_BASE_URL}${imagePath}`;
};

const fetchInitialData = async () => {
  isLoading.value = true;
  clearMessagesAndErrors();
  try {
    console.log('Fetching dishes and combos...');
    const [dishesRes, combosRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/dishes/admin/all`),
      axios.get(`${API_BASE_URL}/combos/admin/all`)
    ]);

    console.log('Complete Dishes API Response:', JSON.stringify(dishesRes.data, null, 2));

    if (dishesRes.data && dishesRes.data.code === 0) {
      if (!Array.isArray(dishesRes.data.data)) {
        console.error('Dishes data is not an array:', dishesRes.data.data);
        errorMessage.value = '菜品数据格式错误';
        return;
      }

      allDishes.value = dishesRes.data.data.map(dish => {
        // 打印完整的菜品数据结构
        console.log(`Complete dish data for ${dish.name}:`, dish);

        // 设置默认值为 true，因为这是管理端，默认应该显示所有菜品
        const isEnabled = dish.is_enabled === undefined ? true : 
                         dish.is_enabled === true || 
                         dish.is_enabled === 1 || 
                         dish.is_enabled === '1' || 
                         dish.is_enabled === 'true' || 
                         dish.is_enabled === 'yes' || 
                         dish.is_enabled === 'Y' || 
                         dish.is_enabled === 'y';

        console.log(`Converted is_enabled for ${dish.name}:`, {
          original: dish.is_enabled,
          converted: isEnabled
        });

        return {
          ...dish,
          is_enabled: isEnabled,
          flavors: dish.flavors ? (typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors) : []
        };
      });

      console.log('Final processed dishes:', allDishes.value.map(d => ({
        name: d.name,
        is_enabled: d.is_enabled,
        id: d.id
      })));
    } else {
      console.error('Failed to fetch dishes:', dishesRes.data);
      errorMessage.value = dishesRes.data?.message || '获取菜品列表失败 (用于套餐)';
    }

    if (combosRes.data && combosRes.data.code === 0) {
      combos.value = combosRes.data.data.map(combo => ({
        ...combo,
        dishes: Array.isArray(combo.dishes) ? combo.dishes : []
      }));
    } else {
      errorMessage.value = (errorMessage.value ? errorMessage.value + "; " : "") + (combosRes.data?.message || '获取套餐列表失败');
    }

  } catch (error) {
    console.error('Error fetching initial data:', error);
    errorMessage.value = error.response?.data?.message || error.message || '加载页面数据失败，请检查网络连接并重试。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInitialData);

const getDishName = (dishId) => {
    const dish = allDishes.value.find(d => d.id === dishId);
    return dish ? dish.name : '未知菜品';
};

const resetCurrentCombo = () => {
  currentCombo.value = { id: null, name: '', description: '', price: null, image_url: null, is_enabled: true, dishes: [] };
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  formErrors.value = {};
};

const openAddModal = () => {
  clearMessagesAndErrors();
  isEditing.value = false;
  resetCurrentCombo();
  showModal.value = true;
};

const openEditModal = (combo) => {
  clearMessagesAndErrors();
  isEditing.value = true;
  // Deep copy and ensure 'dishes' is an array
  currentCombo.value = {
      ...JSON.parse(JSON.stringify(combo)), 
      dishes: Array.isArray(combo.dishes) ? JSON.parse(JSON.stringify(combo.dishes)) : [] 
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
    currentCombo.value.image_url = null; 
  } else {
    selectedImageFile.value = null;
    imagePreviewUrl.value = null;
  }
};

const getDishQuantityInCombo = (dishId) => {
  const foundDish = currentCombo.value.dishes.find(d => d.dish_id === dishId);
  return foundDish ? foundDish.quantity : 0;
};

const incrementDishInCombo = (dishId) => {
  const dishIndex = currentCombo.value.dishes.findIndex(d => d.dish_id === dishId);
  if (dishIndex > -1) {
    currentCombo.value.dishes[dishIndex].quantity++;
  } else {
    currentCombo.value.dishes.push({ dish_id: dishId, quantity: 1 });
  }
  if(formErrors.value.dishes) formErrors.value.dishes = ''; // Clear dish error if user interacts
};

const decrementDishInCombo = (dishId) => {
  const dishIndex = currentCombo.value.dishes.findIndex(d => d.dish_id === dishId);
  if (dishIndex > -1) {
    if (currentCombo.value.dishes[dishIndex].quantity > 1) {
      currentCombo.value.dishes[dishIndex].quantity--;
    } else {
      currentCombo.value.dishes.splice(dishIndex, 1);
    }
  }
};

const validateForm = () => {
  formErrors.value = {};
  let isValid = true;
  if (!currentCombo.value.name.trim()) {
    formErrors.value.name = '套餐名称不能为空。';
    isValid = false;
  }
  if (currentCombo.value.price === null || currentCombo.value.price <= 0) {
    formErrors.value.price = '价格必须大于0。';
    isValid = false;
  }
  if (!currentCombo.value.dishes || currentCombo.value.dishes.length === 0) {
    formErrors.value.dishes = '请至少为套餐选择一个菜品。';
    isValid = false;
  }
  return isValid;
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

const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
}

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  clearMessages();

  const formData = new FormData();
  formData.append('name', currentCombo.value.name);
  formData.append('description', currentCombo.value.description || '');
  formData.append('price', currentCombo.value.price);
  formData.append('is_enabled', currentCombo.value.is_enabled);
  formData.append('dishes', JSON.stringify(currentCombo.value.dishes));

  if (selectedImageFile.value) {
    formData.append('image', selectedImageFile.value);
  }

  try {
    const url = isEditing.value
      ? `${API_BASE_URL}/combos/admin/${currentCombo.value.id}`
      : `${API_BASE_URL}/combos/admin`;
    const method = isEditing.value ? 'put' : 'post';

    const response = await axios({
      method,
      url,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    handleApiSuccess(response, isEditing.value ? '套餐更新成功！' : '套餐添加成功！');
    closeModal();
    await fetchInitialData();
  } catch (error) {
    handleApiError(error, '操作失败');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCombo = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/combos/admin/${id}`);
    handleApiSuccess(response, '套餐删除成功！');
    await fetchInitialData();
  } catch (error) {
    handleApiError(error, '删除失败');
  }
};

const toggleAvailability = async (combo) => {
  clearMessagesAndErrors();
  const originalStatus = combo.is_enabled;
  
  // Optimistic update
  const comboIndex = combos.value.findIndex(c => c.id === combo.id);
  if (comboIndex !== -1) {
    combos.value[comboIndex].is_enabled = !originalStatus;
  }

  const updatedData = {
    ...combo,
    is_enabled: !originalStatus,
    dishes: JSON.stringify(combo.dishes.map(d => ({ dish_id: d.dish_id, quantity: d.quantity })))
  };

  try {
    const response = await axios.put(`${API_BASE_URL}/combos/admin/${combo.id}`, updatedData, {
      headers: { 'Content-Type': 'application/json' },
    });
    handleApiSuccess(response, `套餐 "${combo.name}" 状态已更新。`);
    // On success, we don't need to refetch because of the optimistic update.
  } catch (error) {
    // Revert optimistic update on failure
    if (comboIndex !== -1) {
      combos.value[comboIndex].is_enabled = originalStatus;
    }
    handleApiError(error, `无法更新套餐 "${combo.name}" 的状态。`);
  }
};

const confirmDeleteCombo = async (comboId) => {
  clearMessagesAndErrors();
  if (window.confirm('确定要删除这个套餐吗？此操作无法撤销。')) {
    isSubmitting.value = true;
    try {
      const response = await axios.delete(`${API_BASE_URL}/combos/admin/${comboId}`);
      handleApiSuccess(response, '套餐删除成功！');
      await fetchInitialData();
    } catch (error) {
      handleApiError(error, '删除失败，请重试。');
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
</style>