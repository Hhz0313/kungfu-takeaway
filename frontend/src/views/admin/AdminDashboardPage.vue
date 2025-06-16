<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img 
        :src="backgroundImage" 
        alt="Background" 
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black opacity-0"></div> <!-- Overlay -->
    </div>

    <!-- Centered Content Area -->
    <div class="relative z-10 flex flex-col items-center justify-center text-center p-6 md:p-12">
      <div class="mb-8">
        <img 
          :src="logoImage" 
          alt="功夫宅急送 Logo" 
          class="w-32 h-32 md:w-48 md:h-48 object-contain mx-auto shadow-lg rounded-xl"
        />
      </div>

      <!-- Welcome Text -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight shadow-sm">
        欢迎使用 <span class="text-yellow-400">功夫宅急送</span> 校园点餐系统
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 font-medium mb-12 italic">
        让点餐更简单，让服务更贴心
      </p>

      <!-- Optional: Subtle Divider -->
      <hr class="w-3/4 md:w-1/2 border-blue-600 my-4 opacity-50" />

      <p class="text-white text-xl">
        管理您的菜品、套餐、订单等。
      </p>

    </div>

    <!-- Decorative Footer Image/Banner Placeholder (Optional) -->

    <!-- Branding signature if needed -->
    <div class="absolute bottom-4 right-4 z-10 text-xs text-gray-400 opacity-75">
      功夫宅急送 &copy; {{ new Date().getFullYear() }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Placeholder image paths - replace with your actual image paths
// For local images in /public folder: :src="'/images/logo.png'"
// For images in /src/assets that need processing: :src="require('@/assets/logo.png')" or import logoSrc from '@/assets/logo.png' and use :src="logoSrc"
const logoImage = ref('/images/kungfu-takeaway-logo.png'); // Path for logo in frontend/public/images/
const backgroundImage = ref('/images/HIT-campus-background.jpg'); // Path for background in frontend/public/images/


// No specific logic needed for this display-only page
</script>

<style scoped>
/* Additional custom styles if Tailwind classes are not sufficient */

/* Example of a subtle text shadow for better readability on complex backgrounds */
.text-white, .text-gray-200 {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* You might want to use a specific font for branding */
h1 {
  /* font-family: 'YourBrandFont', sans-serif; */
}
</style> 