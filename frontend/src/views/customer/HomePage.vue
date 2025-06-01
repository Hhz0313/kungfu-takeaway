<template>
  <div class="p-4 text-center">
    <p class="text-lg text-gray-600">正在跳转到菜单页...</p>
    <!-- Optional: Add a spinner or a more elaborate loading message -->
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  router.replace({ name: 'MenuPage' });
});
</script>

<style scoped>
/* You can add specific styles for the loading state if needed */
</style> 