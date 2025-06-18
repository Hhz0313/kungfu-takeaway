<template>
  <div class="flex h-screen flex-col bg-slate-100 font-sans">
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-800 text-slate-100 flex flex-col shadow-lg">
        <div class="px-6 py-5 border-b border-slate-700 text-center">
          <h1 class="text-2xl font-bold text-white">功夫宅急送</h1>
          <span class="text-sm text-slate-400">管理后台</span>
        </div>
        <div v-if="adminUser" class="p-4 border-b border-slate-700 bg-slate-900/50 text-center">
          <p class="text-base font-semibold text-white">欢迎, {{ adminUser.username }}</p>
          <p class="text-xs text-slate-400">很高兴再次见到您</p>
        </div>
        <nav class="flex-1 mt-6 px-3 space-y-1.5">
          <router-link
            to="/admin/dashboard"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            首页
          </router-link>
          <router-link
            to="/admin/categories"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            分类管理
          </router-link>
          <router-link
            to="/admin/dishes"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2z" />
            </svg>
            菜品管理
          </router-link>
          <router-link
            to="/admin/combos"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
            套餐管理
          </router-link>
          <router-link
            to="/admin/orders"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            订单处理
          </router-link>
          <router-link
            to="/admin/stats"
            class="nav-link"
            active-class="nav-link-active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v10a1 1 0 100 2H3zm13 12H4V7h12v8zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            营业统计
          </router-link>
        </nav>
        <!-- Logout Button -->
        <div class="px-4 py-4 mt-auto">
          <button 
            @click="handleLogout"
            class="w-full flex items-center justify-center px-4 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
            </svg>
            退出登录
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 flex flex-col overflow-auto bg-slate-50">
        <div class="flex-1 p-6 md:p-8 lg:p-10">
          <router-view />
        </div>
        <!-- Footer -->
        <footer class="bg-slate-800 text-white shadow-inner py-5 mt-auto">
          <div class="container mx-auto px-6 text-center">
            <p class="text-sm font-medium text-slate-300">
              © {{ new Date().getFullYear() }} 功夫宅急送. All rights reserved.
            </p>
            <p class="text-xs text-slate-400 mt-1">
              美味触手可及, 校园生活更轻松!
            </p>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const adminUser = ref(null);

onMounted(() => {
  const userData = localStorage.getItem('admin-user');
  if (userData) {
    adminUser.value = JSON.parse(userData);
  }
});

const handleLogout = () => {
  // Clear admin data from localStorage
  localStorage.removeItem('admin-token');
  localStorage.removeItem('admin-user');
  
  // Redirect to the admin login page
  router.push('/admin/login');
};
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-3 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-150 ease-in-out;
}
.nav-link-active {
  @apply bg-blue-600 text-white font-semibold shadow-md;
}
</style> 