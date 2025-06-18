<template>
  <div class="bg-slate-50 min-h-screen">
    <div class="container mx-auto p-4 sm:p-6 lg:p-8">
      <!-- Page Header -->
      <div class="mb-6 md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight text-slate-800">分类管理</h1>
          <p class="mt-1 text-sm text-slate-500">在这里管理您的菜品和套餐分类</p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <button
            @click="openAddModal"
            class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-50 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            添加新分类
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div class="space-y-4 mb-6">
        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-center items-center py-10 bg-white rounded-lg shadow-sm">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="ml-3 text-lg font-medium text-slate-600">加载中...</p>
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
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clip-rule="evenodd" fill-rule="evenodd"/></svg></div>
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
        <!-- Categories Table -->
        <div v-if="!isLoading && categories.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-100">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">名称</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">描述</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">状态</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="category in categories" :key="category.id" class="hover:bg-slate-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900">{{ category.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-600">{{ category.description || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="category.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ category.is_enabled ? '启用' : '禁用' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <button @click="openEditModal(category)" class="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 font-medium inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                    </svg>
                    编辑
                  </button>
                  <button
                    @click="openConfirmationModal(category)"
                    :class="category.is_enabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'"
                    class="transition-colors duration-150 font-medium inline-flex items-center"
                  >
                    <svg v-if="category.is_enabled" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    {{ category.is_enabled ? '禁用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Empty State -->
        <div v-if="!isLoading && categories.length === 0" class="text-center py-16 px-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M5 11h14" />
          </svg>
          <p class="mt-4 text-xl font-semibold text-slate-600">暂无分类信息</p>
          <p class="mt-2 text-sm text-slate-500">点击下方按钮，开始创建您的第一个分类吧！</p>
          <div class="mt-6">
            <button
              @click="openAddModal"
              class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              添加新分类
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed z-20 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
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
                  <h3 class="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                    {{ isEditing ? '编辑分类' : '添加新分类' }}
                  </h3>
                  <div class="mt-5 space-y-5">
                    <div>
                      <label for="categoryName" class="block text-sm font-medium text-slate-700">名称 <span class="text-red-500">*</span></label>
                      <input type="text" v-model="currentCategory.name" name="categoryName" id="categoryName" required class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400" placeholder="例如：主食类">
                    </div>
                    <div>
                      <label for="categoryDescription" class="block text-sm font-medium text-slate-700">描述</label>
                      <textarea v-model="currentCategory.description" name="categoryDescription" id="categoryDescription" rows="3" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-400" placeholder="可选，简短描述该分类"></textarea>
                    </div>
                    <div v-if="isEditing" class="flex items-center">
                       <input id="categoryEnabled" name="categoryEnabled" type="checkbox" v-model="currentCategory.is_enabled" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded">
                       <label for="categoryEnabled" class="ml-2 block text-sm text-slate-700">启用该分类</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="isLoading" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isLoading ? '保存中...' : (isEditing ? '保存更改' : '创建分类') }}
              </button>
              <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmationModal" class="fixed z-30 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeConfirmationModal"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">确认操作</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    您确定要<span :class="categoryToToggle.is_enabled ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'">{{ categoryToToggle.is_enabled ? '禁用' : '启用' }}</span>分类 
                    <span class="font-semibold text-slate-800">"{{ categoryToToggle.name }}"</span> 吗?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="confirmToggleCategoryStatus" type="button" 
                    :class="categoryToToggle.is_enabled ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
              确认
            </button>
            <button @click="closeConfirmationModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const categories = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const currentCategory = ref({
  id: null,
  name: '',
  description: '',
  is_enabled: true,
});

const showConfirmationModal = ref(false);
const categoryToToggle = ref(null);

// Ensure API_BASE_URL is correctly defined, typically it would be in a global config or .env
// For this example, assuming it's correctly set up to point to your backend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


const clearMessages = () => {
  errorMessage.value = '';
  successMessage.value = '';
};

const fetchCategories = async () => {
  isLoading.value = true;
  clearMessages();
  try {
    // Changed to admin/all endpoint
    const response = await axios.get(`${API_BASE_URL}/categories/admin/all`);
    if (response.data && response.data.code === 0) {
      categories.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取分类列表失败');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    errorMessage.value = error.response?.data?.message || error.message || '无法连接到服务器或获取数据失败。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchCategories);

const openAddModal = () => {
  clearMessages();
  isEditing.value = false;
  currentCategory.value = { id: null, name: '', description: '', is_enabled: true };
  showModal.value = true;
};

const openEditModal = (category) => {
  clearMessages();
  isEditing.value = true;
  currentCategory.value = { ...category };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const openConfirmationModal = (category) => {
  categoryToToggle.value = category;
  showConfirmationModal.value = true;
};

const closeConfirmationModal = () => {
  showConfirmationModal.value = false;
  categoryToToggle.value = null;
};

const confirmToggleCategoryStatus = async () => {
  if (categoryToToggle.value) {
    await toggleCategoryStatus(categoryToToggle.value);
  }
  closeConfirmationModal();
};

const handleSubmit = async () => {
  clearMessages();
  if (!currentCategory.value.name.trim()) {
    errorMessage.value = '分类名称不能为空。';
    return;
  }

  const submitButtonLoadingState = isLoading.value;
  isLoading.value = true;

  try {
    let response;
    const url = isEditing.value
      ? `${API_BASE_URL}/categories/admin/${currentCategory.value.id}`
      : `${API_BASE_URL}/categories/admin`;
    
    const method = isEditing.value ? 'put' : 'post';

    response = await axios[method](url, currentCategory.value);

    if (response.data && response.data.code === 0) {
      successMessage.value = isEditing.value ? '分类更新成功！' : '分类添加成功！';
      closeModal();
      await fetchCategories();
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      throw new Error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('Error submitting category:', error);
    errorMessage.value = error.response?.data?.message || error.message || '操作失败，请重试。';
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  } finally {
    isLoading.value = submitButtonLoadingState;
  }
};

const toggleCategoryStatus = async (category) => {
  clearMessages();
  const originalStatus = category.is_enabled;
  // Optimistic update
  categories.value = categories.value.map(c =>
    c.id === category.id ? { ...c, is_enabled: !c.is_enabled } : c
  );

  try {
    const response = await axios.put(`${API_BASE_URL}/categories/admin/${category.id}`, {
      ...category,
      is_enabled: !originalStatus,
    });

    if (response.data && response.data.code === 0) {
      successMessage.value = `分类 "${category.name}" 状态已更新。`;
    } else {
      throw new Error(response.data.message || '状态更新失败');
    }
  } catch (error) {
    console.error('Error toggling category status:', error);
    errorMessage.value = `无法更新分类 "${category.name}" 的状态。请刷新后重试。`;
    // Revert on error
    categories.value = categories.value.map(c =>
      c.id === category.id ? { ...c, is_enabled: originalStatus } : c
    );
  } finally {
    setTimeout(() => {
      clearMessages();
    }, 3000);
  }
};
</script>

<style scoped>
/* Additional page-specific styles if needed */
input:required:invalid {
  border-color: #f87171; /* red-400 */
}

input:required:invalid:focus {
    outline: 1px solid #f87171;
    border-color: #f87171;
    box-shadow: 0 0 0 1px #f87171;
}
</style> 