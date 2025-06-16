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
          <h1 class="text-3xl font-bold text-gray-800">用户登录</h1>
          <p class="mt-2 text-gray-500">欢迎来到功夫宅急送</p>
        </div>
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="text-sm font-medium text-gray-700">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请输入您的用户名"
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
              placeholder="请输入您的密码"
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
              登录
            </button>
          </div>
        </form>
        <div class="text-sm text-center">
          <p class="text-gray-600">
            还没有账户？
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
              立即注册
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
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    const response = await axios.post('http://localhost:3000/api/users/login', {
      username: username.value,
      password: password.value,
    });

    if (response.data.token) {
      localStorage.setItem('user-token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/home');
    }
  } catch (error) {
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = '登录失败，请稍后再试。';
    }
  }
};
</script> 