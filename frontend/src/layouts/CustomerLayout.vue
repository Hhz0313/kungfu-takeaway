<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="backdrop-blur-md bg-gradient-to-r from-red-600/90 to-yellow-500/90 text-white shadow-2xl sticky top-0 z-50 rounded-b-2xl border-b-4 border-yellow-400/60">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo/Brand Name -->
          <div class="flex items-center space-x-3 flex-shrink-0">
            <img src="/images/kungfu-takeaway-logo.png" alt="logo" class="h-12 w-12 rounded-full shadow-lg border-2 border-white bg-white/80 object-cover" />
            <router-link to="/menu" class="text-3xl font-extrabold tracking-tight hover:opacity-90 transition-opacity drop-shadow-lg">
              功夫宅急送
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-2">
            <router-link to="/menu" class="px-4 py-2 rounded-xl text-base font-semibold text-gray-100 hover:bg-yellow-400 hover:text-red-700 hover:scale-110 shadow-md transition-all duration-200 ease-in-out tracking-wide" active-class="bg-white text-red-700 shadow-xl scale-110 border-2 border-yellow-400">菜单</router-link>
            <router-link to="/cart" class="px-4 py-2 rounded-xl text-base font-semibold text-gray-100 hover:bg-yellow-400 hover:text-red-700 hover:scale-110 shadow-md transition-all duration-200 ease-in-out tracking-wide" active-class="bg-white text-red-700 shadow-xl scale-110 border-2 border-yellow-400">我的购物车</router-link>
            <router-link to="/my-orders" class="px-4 py-2 rounded-xl text-base font-semibold text-gray-100 hover:bg-yellow-400 hover:text-red-700 hover:scale-110 shadow-md transition-all duration-200 ease-in-out tracking-wide" active-class="bg-white text-red-700 shadow-xl scale-110 border-2 border-yellow-400">我的订单</router-link>
            <router-link to="/my-addresses" class="px-4 py-2 rounded-xl text-base font-semibold text-gray-100 hover:bg-yellow-400 hover:text-red-700 hover:scale-110 shadow-md transition-all duration-200 ease-in-out tracking-wide" active-class="bg-white text-red-700 shadow-xl scale-110 border-2 border-yellow-400">地址管理</router-link>
          </nav>

          <!-- 右侧用户区 -->
          <div class="flex items-center space-x-4">
            <!-- 搜索框（可选） -->
            <!-- <input type="text" placeholder="搜索美食..." class="hidden lg:block px-3 py-1 rounded-full bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner transition w-40" /> -->
            <!-- 用户头像/菜单 -->
            <div class="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-300 to-red-400 flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-105 transition-transform">
              <svg class="h-7 w-7 text-white/90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <!-- 移动端菜单按钮 -->
            <div class="md:hidden flex items-center">
              <button @click="mobileMenuOpen = !mobileMenuOpen" class="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors">
                <span class="sr-only">Open main menu</span>
                <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-gradient-to-r from-red-600/95 to-yellow-500/95 border-t border-red-500 rounded-b-2xl shadow-xl">
        <nav class="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <router-link to="/menu" class="block px-3 py-3 rounded-xl text-lg font-bold text-gray-100 hover:bg-yellow-400 hover:text-red-700 transition-colors duration-150 ease-in-out" active-class="bg-white text-red-700" @click="mobileMenuOpen = false">菜单</router-link>
          <router-link to="/cart" class="block px-3 py-3 rounded-xl text-lg font-bold text-gray-100 hover:bg-yellow-400 hover:text-red-700 transition-colors duration-150 ease-in-out" active-class="bg-white text-red-700" @click="mobileMenuOpen = false">我的购物车</router-link>
          <router-link to="/my-orders" class="block px-3 py-3 rounded-xl text-lg font-bold text-gray-100 hover:bg-yellow-400 hover:text-red-700 transition-colors duration-150 ease-in-out" active-class="bg-white text-red-700" @click="mobileMenuOpen = false">我的订单</router-link>
          <router-link to="/my-addresses" class="block px-3 py-3 rounded-xl text-lg font-bold text-gray-100 hover:bg-yellow-400 hover:text-red-700 transition-colors duration-150 ease-in-out" active-class="bg-white text-red-700" @click="mobileMenuOpen = false">地址管理</router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white text-center py-6 px-4 mt-auto border-t-2 border-red-700">
      <p class="font-semibold">&copy; {{ new Date().getFullYear() }} 功夫宅急送. All rights reserved.</p>
      <p class="text-sm text-gray-400 mt-1">美味触手可及, 校园生活更轻松!</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const mobileMenuOpen = ref(false);
</script>

<style scoped>
header {
  /* 更强的阴影和圆角 */
  box-shadow: 0 8px 24px 0 rgba(0,0,0,0.12), 0 1.5px 4px 0 rgba(255,200,0,0.08);
  border-bottom-left-radius: 1.5rem;
  border-bottom-right-radius: 1.5rem;
}

.container {
  max-width: 1280px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>