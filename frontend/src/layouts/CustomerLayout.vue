<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="backdrop-blur-md bg-gradient-to-r from-red-600/90 to-yellow-500/90 text-white shadow-2xl sticky top-0 z-50 rounded-b-2xl border-b-4 border-yellow-400/60">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo/Brand Name -->
          <div class="flex items-center space-x-3 flex-shrink-0">
            <img src="/logo.png" alt="logo" class="h-12 w-12 rounded-full shadow-lg border-2 border-white bg-white/80 object-cover" />
            <router-link to="/home/menu" class="text-3xl font-extrabold tracking-tight hover:opacity-90 transition-opacity drop-shadow-lg">
              功夫宅急送
            </router-link>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-2">
            <router-link to="/home/menu" class="nav-link" active-class="nav-link-active">菜单</router-link>
            <router-link to="/home/cart" class="nav-link" active-class="nav-link-active">购物车</router-link>
            <router-link to="/home/my-orders" class="nav-link" active-class="nav-link-active">我的订单</router-link>
          </nav>

          <!-- User Menu -->
          <div class="flex items-center">
            <!-- Authenticated User -->
            <div v-if="user" class="relative" ref="dropdownContainer">
              <button @click="isDropdownOpen = !isDropdownOpen" class="flex items-center space-x-2 focus:outline-none h-12 w-12 rounded-full bg-gradient-to-br from-yellow-300 to-red-400 justify-center shadow-md border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                 <svg class="h-7 w-7 text-white/90" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div v-show="isDropdownOpen" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 text-gray-700">
                  <div class="px-4 py-3 border-b border-gray-200">
                    <p class="text-sm">欢迎您</p>
                    <p class="text-sm font-medium text-gray-900 truncate">{{ user.username }}</p>
                  </div>
                  <div class="py-1">
                    <router-link to="/home/profile" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>
                      个人中心
                    </router-link>
                    <router-link to="/home/my-addresses" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                      我的地址
                    </router-link>
                  </div>
                  <div class="py-1 border-t border-gray-200">
                    <a @click="handleLogout" href="#" class="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" /></svg>
                      退出登录
                    </a>
                  </div>
                </div>
              </transition>
            </div>
            <!-- Guest User -->
            <div v-else>
              <router-link to="/login" class="nav-link" active-class="nav-link-active">登录 / 注册</router-link>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const isDropdownOpen = ref(false);
const dropdownContainer = ref(null); // Ref for the dropdown container
const router = useRouter();

const updateUser = () => {
  const userData = localStorage.getItem('user');
  user.value = userData ? JSON.parse(userData) : null;
};

const handleLogout = () => {
  isDropdownOpen.value = false;
  localStorage.removeItem('user-token');
  localStorage.removeItem('user');
  user.value = null;
  router.push('/login');
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

window.addEventListener('storage', updateUser);

onMounted(() => {
  updateUser();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('storage', updateUser);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.nav-link {
  @apply px-4 py-2 rounded-xl text-base font-semibold text-gray-100 hover:bg-yellow-400 hover:text-red-700 hover:scale-110 shadow-md transition-all duration-200 ease-in-out tracking-wide;
}
.nav-link-active {
  @apply bg-white text-red-700 shadow-xl scale-110 border-2 border-yellow-400;
}
.dropdown-item {
  @apply flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>