<template>
  <div class="relative min-h-screen bg-gray-100">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center z-0"
      :style="{ backgroundImage: `url(${bgImage})` }"
    ></div>
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black opacity-40 z-10"></div>

    <div class="relative flex items-center justify-center min-h-screen z-20">
      <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-2xl">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-800">注册</h1>
          <p class="mt-2 text-gray-500">创建您的功夫宅急送账户</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-4 text-center bg-green-100 text-green-800 rounded-md">
          {{ successMessage }}
        </div>

        <form v-else class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="username" class="text-sm font-medium text-gray-700">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label for="password" class="text-sm font-medium text-gray-700">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入密码"
            />
          </div>
          <div>
            <label for="confirmPassword" class="text-sm font-medium text-gray-700">确认密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请再次输入密码"
            />
          </div>
          <div v-if="errorMessage" class="text-sm text-red-600">
            {{ errorMessage }}
          </div>
          <div>
            <button
              type="submit"
              class="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              注册
            </button>
          </div>
        </form>

        <div class="text-sm text-center">
          <p class="text-gray-600">
            已有账户？
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              立即登录
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import bgImage from '@/assets/images/background.jpg';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const handleRegister = async () => {
  errorMessage.value = '';
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }

  try {
    await axios.post('/api/users/register', {
      username: username.value,
      password: password.value,
    });
    
    successMessage.value = '注册成功！即将跳转到登录页面...';
    
    // 延迟2秒后跳转
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = '注册失败，请稍后再试。';
    }
  }
};
</script> 