<template>
  <!-- Main container with background -->
  <div class="relative min-h-screen overflow-hidden bg-gray-900">
    <div
      class="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out transform scale-105"
      :style="{ backgroundImage: `url('/HIT-background.png')` }"
    ></div>
    <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>

    <!-- Content container -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
      
      <!-- Main Logo: Added rounded corners -->
      <img src="/logo.png" alt="功夫宅急送 Logo" class="w-40 h-40 mb-6 rounded-3xl shadow-2xl transition-transform duration-300 hover:scale-110" />

      <!-- Card -->
      <div class="w-full max-w-2xl p-8 text-center bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20">
        
        <!-- Welcome Text: Upgraded font size and added gradient -->
        <h1 class="text-5xl font-extrabold tracking-tight text-white drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
          哈工大专属点餐平台
        </h1>
        <p class="mt-4 text-lg text-slate-300 drop-shadow-md">
          规格严格，功夫到家
        </p>

        <!-- Divider -->
        <div class="w-32 h-px mx-auto my-8 bg-white/20"></div>

        <!-- Login Buttons -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">

          <!-- Customer Button -->
          <router-link to="/login"
            class="login-button group ring-offset-slate-900 from-blue-500 to-sky-500 hover:shadow-sky-500/30">
            <div class="button-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <span class="button-text">我是顾客</span>
            <span class="button-subtext">进入点餐</span>
          </router-link>

          <!-- Admin Button -->
          <router-link to="/admin/login"
            class="login-button group ring-offset-slate-900 from-slate-600 to-slate-700 hover:shadow-slate-500/30">
            <div class="button-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="button-text">我是管理员</span>
            <span class="button-subtext">进入后台</span>
          </router-link>
        </div>
      </div>

      <!-- Decorative Logos Footer: Made larger and more prominent -->
      <div class="flex items-center justify-center mt-10 space-x-8">
        <img src="/hit-emblem.png" alt="哈工大校徽" class="w-16 h-16 opacity-70 transition-all duration-300 hover:opacity-100 hover:scale-110 drop-shadow-lg" title="哈尔滨工业大学" />
        <img src="/canteen-logo.jpg" alt="食堂Logo" class="w-16 h-16 opacity-70 transition-all duration-300 hover:opacity-100 hover:scale-110 rounded-full drop-shadow-lg" title="哈工大食堂" />
      </div>
    </div>
  </div>
</template>

<script setup>
// All images are referenced directly from the public folder, so no script import is needed.
</script>

<style scoped>
.login-button {
  @apply relative flex flex-col items-center justify-center p-6 text-white transition-all duration-300 bg-gradient-to-br rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2;
}

.button-icon-wrapper {
  @apply flex items-center justify-center w-16 h-16 mb-2 rounded-full;
}

.button-text {
  @apply text-xl font-bold uppercase tracking-wider;
}
.button-subtext {
  @apply text-sm font-light tracking-widest opacity-80;
}
</style>