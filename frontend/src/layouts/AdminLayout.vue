<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-800 text-slate-100 flex flex-col shadow-lg">
      <div class="px-6 py-5 border-b border-slate-700">
        <h1 class="text-2xl font-bold text-white">功夫宅急送</h1>
        <span class="text-sm text-slate-400">管理后台</span>
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
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v10a1 1 0 100 2h14a1 1 0 100-2V5a1 1 0 100-2H3zm13 12H4V7h12v8zM7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd" />
          </svg>
          营业统计
        </router-link>
      </nav>
      <div class="mt-auto p-4 border-t border-slate-700">
        <router-link
            to="/"
            class="nav-link text-sm hover:bg-slate-700 focus:bg-slate-600"
        >
         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
         </svg>
          返回用户端
        </router-link>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6 md:p-8 lg:p-10 overflow-auto bg-slate-50">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No specific script needed for the layout itself,
// interactivity comes from router-link and router-view
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-3 py-3 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors duration-150 ease-in-out;
}
.nav-link-active {
  @apply bg-blue-600 text-white font-semibold shadow-md;
}
</style> 