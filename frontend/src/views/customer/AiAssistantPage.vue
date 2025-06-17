<template>
  <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 min-h-screen p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header -->
      <header class="text-center mb-8 animate-fade-in-down">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            AI 点餐助手
          </span>
        </h1>
        <p class="mt-3 text-base text-gray-500 sm:text-lg">你的专属美食顾问，为你量身推荐功夫好味道！</p>
      </header>
      
      <!-- Main Content Card -->
      <main class="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 min-h-[60vh] flex flex-col justify-center">
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="flex justify-center items-center h-full">
          <div class="text-center">
             <svg class="animate-spin h-12 w-12 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 text-gray-600 font-semibold">正在为您精心准备推荐，请稍候...</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-600 bg-red-100 p-4 rounded-lg text-center animate-shake">
          <p class="font-bold text-lg">哎呀，出错了！</p>
          <p class="mt-1">{{ error }}</p>
        </div>

        <!-- AI Response Area -->
        <div v-if="!isLoading && !error" class="w-full">
          <!-- AI message bubble -->
          <div class="flex items-start gap-3 sm:gap-4 animate-fade-in-up">
            <!-- AI Avatar -->
            <div class="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              AI
            </div>
            <!-- Message content -->
            <div class="bg-white rounded-lg rounded-tl-none p-4 shadow-sm flex-1 min-w-0">
              <div class="prose prose-indigo max-w-none" v-html="formattedRecommendation"></div>
            </div>
          </div>

          <!-- Actionable Items Card -->
          <div v-if="actionableItems.length > 0" class="mt-6 ml-12 sm:ml-16 animate-fade-in-up animation-delay-300">
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM8.293 16a2.001 2.001 0 003.414 0H8.293z" />
                </svg>
                为你推荐的菜品
              </h3>
              <ul class="space-y-2 mb-4">
                <li v-for="item in actionableItems" :key="item.id" class="flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                   </svg>
                  <span class="font-medium text-gray-700">{{ item.name }}</span>
                  <span class="text-xs bg-indigo-200 text-indigo-800 font-semibold px-2 py-0.5 rounded-full ml-2">{{ item.type === 'dish' ? '菜品' : '套餐' }}</span>
                </li>
              </ul>
              <button 
                @click="addItemsToCart"
                :disabled="isAddingToCart"
                class="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105">
                <svg v-if="isAddingToCart" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                {{ isAddingToCart ? '正在添加...' : '一键加入购物车' }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Toast Notification -->
      <div v-if="toast.show" :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'" class="fixed bottom-10 right-10 text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 transform animate-fade-in-up" role="alert">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { marked } from 'marked';

const isLoading = ref(true);
const recommendationText = ref('');
const actionableItems = ref([]);
const error = ref(null);
const isAddingToCart = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

const formattedRecommendation = computed(() => {
  if (recommendationText.value) {
    return marked(recommendationText.value)
      .replace(/<h2/g, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3"')
      .replace(/<h3/g, '<h3 class="text-lg font-semibold text-gray-700 mt-4 mb-2"')
      .replace(/<ul/g, '<ul class="list-disc list-inside"')
      .replace(/<strong/g, '<strong class="text-indigo-600"');
  }
  return '';
});

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const fetchRecommendation = async () => {
  isLoading.value = true;
  error.value = null;
  actionableItems.value = [];
  recommendationText.value = '';

  try {
    const token = localStorage.getItem('user-token');
    if (!token) throw new Error('用户未登录，无法获取推荐。');

    const response = await axios.post('/api/ai/recommend', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data.data;
    if (data && data.recommendationText) {
      recommendationText.value = data.recommendationText;
      actionableItems.value = data.actionableItems || [];
    } else {
      throw new Error('未能从服务器获取有效的推荐内容。');
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || '获取AI推荐失败，请稍后再试。';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const addItemsToCart = async () => {
  isAddingToCart.value = true;
  const token = localStorage.getItem('user-token');
  if (!token) {
    showToast('请先登录', 'error');
    isAddingToCart.value = false;
    return;
  }

  try {
    const promises = actionableItems.value.map(item => {
      return axios.post('/api/cart', {
        item_id: item.id,
        item_type: item.type,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    });
    
    await Promise.all(promises);
    showToast('推荐菜品已成功加入购物车！', 'success');
  } catch (err) {
    showToast('添加购物车失败，请稍后再试。', 'error');
    console.error(err);
  } finally {
    isAddingToCart.value = false;
  }
};

onMounted(() => {
  fetchRecommendation();
});
</script>

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out forwards;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.5s ease-in-out forwards;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.prose {
  line-height: 1.7;
}
.prose :where(p):not(:where([class~="not-prose"] *)) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
</style> 