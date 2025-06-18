<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Page Header -->
      <div class="mb-6 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight text-slate-800">套餐管理</h1>
          <p class="mt-1 text-sm text-slate-500">创建和管理您的优惠套餐</p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button @click="openAddModal" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 transition-all duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加新套餐
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-4 mb-6">
        <!-- Loading Indicator -->
        <div v-if="isLoading && !combos.length" class="flex justify-center items-center py-10 bg-white rounded-lg shadow-sm">
           <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="ml-3 text-lg font-medium text-slate-600">加载套餐数据中...</p>
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

      <!-- Main Content Area -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Combos Table -->
        <div v-if="!isLoading || combos.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">图片</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">名称</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">价格</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">包含菜品</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="combo in combos" :key="combo.id" class="hover:bg-slate-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <img :src="getImageUrl(combo.image_url)" :alt="combo.name" class="h-12 w-12 rounded-md object-cover shadow-sm" v-if="combo.image_url"/>
                  <div v-else class="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center">
                    <svg class="h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ combo.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">¥{{ combo.price.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 max-w-xs">
                  <ul v-if="combo.dishes && combo.dishes.length > 0" class="list-disc list-inside text-xs space-y-1">
                    <li v-for="dishItem in combo.dishes" :key="dishItem.dish_id" class="truncate">
                      {{ getDishName(dishItem.dish_id) }} <span class="text-slate-500">x{{ dishItem.quantity }}</span>
                    </li>
                  </ul>
                  <span v-else class="text-xs text-slate-400 italic">无</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="combo.is_enabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ combo.is_enabled ? '在售' : '停售' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                   <button @click="openEditModal(combo)" class="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-150">编辑</button>
                   <button @click="openToggleConfirm(combo)" :class="combo.is_enabled ? 'font-medium text-amber-600 hover:text-amber-800' : 'font-medium text-green-600 hover:text-green-800'" class="transition-colors duration-150">
                    {{ combo.is_enabled ? '停售' : '上架' }}
                  </button>
                  <button @click="openDeleteConfirm(combo)" class="font-medium text-red-600 hover:text-red-800 transition-colors duration-150">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!isLoading && combos.length === 0" class="text-center py-16 px-6">
          <svg class="mx-auto h-16 w-16 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12.75l-7.5 7.5-7.5-7.5m15-5.25l-7.5 7.5-7.5-7.5" />
          </svg>
          <p class="mt-4 text-xl font-semibold text-slate-600">暂无套餐信息</p>
          <p class="mt-2 text-sm text-slate-500">点击下方按钮，开始创建您的第一个套餐吧！</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Combo Modal -->
    <div v-if="showModal" class="fixed z-20 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="handleSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div class="sm:flex sm:items-start">
                 <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg v-if="isEditing" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
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
                      <input type="file" @change="handleImageUpload" id="comboImage" accept="image/*" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"/>
                      <div class="mt-2">
                        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" alt="图片预览" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                        <img v-else-if="isEditing && currentCombo.image_url" :src="getImageUrl(currentCombo.image_url)" alt="当前图片" class="h-28 w-auto rounded-md shadow-sm object-cover"/>
                      </div>
                    </div>

                    <!-- Dish Selection -->
                    <div class="sm:col-span-2">
                      <h4 class="block text-sm font-medium text-slate-700 mb-2">选择菜品 <span class="text-red-500">*</span></h4>
                      <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2 bg-slate-50">
                        <div v-for="dish in selectableDishes" :key="dish.id" class="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150">
                          <div>
                            <span class="font-medium text-sm text-slate-800">{{ dish.name }}</span>
                            <span class="text-xs text-slate-500 ml-2">(¥{{ dish.price.toFixed(2) }})</span>
                          </div>
                          <div class="flex items-center">
                            <button type="button" @click="decrementDishInCombo(dish.id)" class="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors duration-150">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" /></svg>
                            </button>
                            <span class="w-10 text-center text-sm font-semibold text-slate-800">{{ getDishQuantityInCombo(dish.id) }}</span>
                            <button type="button" @click="incrementDishInCombo(dish.id)" class="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-colors duration-150">
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
              <button type="submit" :disabled="isSubmitting" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isSubmitting ? '处理中...' : (isEditing ? '保存更改' : '创建套餐') }}
              </button>
              <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modals -->
    <div v-if="showToggleConfirmModal || showDeleteConfirmModal" class="fixed z-30 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeConfirmModals"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10" :class="showDeleteConfirmModal ? 'bg-red-100' : 'bg-yellow-100'">
                <svg class="h-6 w-6" :class="showDeleteConfirmModal ? 'text-red-600' : 'text-yellow-600'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ showDeleteConfirmModal ? '确认删除' : '确认操作' }}
                </h3>
                <div class="mt-2">
                  <p v-if="comboToModify" class="text-sm text-gray-500">
                    <span v-if="showDeleteConfirmModal">您确定要永久删除套餐 <strong class="text-slate-800">"{{ comboToModify.name }}"</strong> 吗？此操作无法撤销。</span>
                    <span v-else>您确定要将套餐 <strong class="text-slate-800">"{{ comboToModify.name }}"</strong> 的状态更改为 <strong :class="comboToModify.is_enabled ? 'text-amber-600' : 'text-green-600'">{{ comboToModify.is_enabled ? '停售' : '在售' }}</strong> 吗?</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="handleConfirmAction" type="button" 
                    :class="showDeleteConfirmModal ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : (comboToModify && comboToModify.is_enabled ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500')"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
              确认
            </button>
            <button @click="closeConfirmModals" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
              取消
            </button>
          </div>
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
const formErrors = ref({});

// Confirmation Modals State
const showToggleConfirmModal = ref(false);
const showDeleteConfirmModal = ref(false);
const comboToModify = ref(null);

const selectableDishes = computed(() => {
  if (!Array.isArray(allDishes.value)) return [];
  // Only show available dishes for selection in a combo
  return allDishes.value.filter(dish => dish && dish.is_available === true);
});

const clearMessages = (timeout = 0) => {
  if (timeout > 0) {
    setTimeout(() => {
      errorMessage.value = '';
      successMessage.value = '';
    }, timeout);
  } else {
    errorMessage.value = '';
    successMessage.value = '';
    formErrors.value = {};
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  return `${UPLOADS_BASE_URL}${imagePath}`;
};

const fetchInitialData = async () => {
  isLoading.value = true;
  clearMessages();
  try {
    const [dishesRes, combosRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/dishes/admin/all`),
      axios.get(`${API_BASE_URL}/combos/admin/all`)
    ]);

    if (dishesRes.data && dishesRes.data.code === 0) {
      allDishes.value = dishesRes.data.data.map(dish => ({
        ...dish,
        is_available: dish.is_available === true || dish.is_available === 1,
        flavors: dish.flavors ? (typeof dish.flavors === 'string' ? JSON.parse(dish.flavors) : dish.flavors) : []
      }));
    } else {
      throw new Error(dishesRes.data?.message || '获取菜品列表失败');
    }

    if (combosRes.data && combosRes.data.code === 0) {
      combos.value = combosRes.data.data.map(combo => ({
        ...combo,
        dishes: Array.isArray(combo.dishes) ? combo.dishes : []
      }));
    } else {
      throw new Error(combosRes.data?.message || '获取套餐列表失败');
    }
  } catch (error) {
    handleApiError(error, '加载页面数据失败，请检查网络连接并重试。');
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
  clearMessages();
  isEditing.value = false;
  resetCurrentCombo();
  showModal.value = true;
};

const openEditModal = (combo) => {
  clearMessages();
  isEditing.value = true;
  currentCombo.value = JSON.parse(JSON.stringify(combo));
  if (!Array.isArray(currentCombo.value.dishes)) {
      currentCombo.value.dishes = [];
  }
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
  if(formErrors.value.dishes) formErrors.value.dishes = '';
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
  if (!currentCombo.value.name.trim()) formErrors.value.name = '套餐名称不能为空。';
  if (currentCombo.value.price === null || currentCombo.value.price <= 0) formErrors.value.price = '价格必须大于0。';
  if (!currentCombo.value.dishes || currentCombo.value.dishes.length === 0) formErrors.value.dishes = '请至少为套餐选择一个菜品。';
  return Object.keys(formErrors.value).length === 0;
};

const handleApiSuccess = (response, successMsg) => {
  if (response.data && response.data.code === 0) {
    successMessage.value = successMsg;
    clearMessages(3000);
  } else {
    throw new Error(response.data.message || '操作失败');
  }
};

const handleApiError = (error, defaultMsg) => {
  console.error('API Error:', error);
  errorMessage.value = error.response?.data?.message || error.message || defaultMsg;
  clearMessages(5000);
};

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
  } else if (isEditing.value && currentCombo.value.image_url) {
    formData.append('image_url', currentCombo.value.image_url);
  }

  try {
    const url = isEditing.value
      ? `${API_BASE_URL}/combos/admin/${currentCombo.value.id}`
      : `${API_BASE_URL}/combos/admin`;
    const method = isEditing.value ? 'put' : 'post';

    const response = await axios({ method, url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });

    handleApiSuccess(response, isEditing.value ? '套餐更新成功！' : '套餐添加成功！');
    closeModal();
    await fetchInitialData();
  } catch (error) {
    handleApiError(error, '操作失败');
  } finally {
    isSubmitting.value = false;
  }
};

// --- Confirmation Modal Logic ---
const openToggleConfirm = (combo) => {
  comboToModify.value = combo;
  showToggleConfirmModal.value = true;
};

const openDeleteConfirm = (combo) => {
  comboToModify.value = combo;
  showDeleteConfirmModal.value = true;
};

const closeConfirmModals = () => {
  showToggleConfirmModal.value = false;
  showDeleteConfirmModal.value = false;
  comboToModify.value = null;
};

const handleConfirmAction = async () => {
  if (showDeleteConfirmModal.value) {
    await handleDeleteCombo();
  } else if (showToggleConfirmModal.value) {
    await handleToggleAvailability();
  }
  closeConfirmModals();
};

const handleToggleAvailability = async () => {
  if (!comboToModify.value) return;
  clearMessages();
  
  const combo = comboToModify.value;
  const originalStatus = combo.is_enabled;

  const comboIndex = combos.value.findIndex(c => c.id === combo.id);
  if (comboIndex !== -1) {
    combos.value[comboIndex].is_enabled = !originalStatus;
  }

  try {
    const response = await axios.put(`${API_BASE_URL}/combos/admin/${combo.id}`, {
      is_enabled: !originalStatus
    });
    handleApiSuccess(response, `套餐 "${combo.name}" 状态已更新。`);
    await fetchInitialData();
  } catch (error) {
    if (comboIndex !== -1) {
      combos.value[comboIndex].is_enabled = originalStatus; // Revert on error
    }
    handleApiError(error, `无法更新套餐 "${combo.name}" 的状态。`);
  }
};

const handleDeleteCombo = async () => {
  if (!comboToModify.value) return;
  clearMessages();
  isSubmitting.value = true;
  try {
    const response = await axios.delete(`${API_BASE_URL}/combos/admin/${comboToModify.value.id}`);
    handleApiSuccess(response, '套餐删除成功！');
    await fetchInitialData();
  } catch (error) {
    handleApiError(error, '删除失败');
  } finally {
    isSubmitting.value = false;
  }
};

</script>

<style scoped>
.input-field {
  @apply mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none;
}
input:required:invalid {
  border-color: #f87171; /* red-400 */
}
input:required:invalid:focus {
    outline: 1px solid #f87171;
    border-color: #f87171;
    box-shadow: 0 0 0 1px #f87171;
}
</style>