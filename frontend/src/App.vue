<template>
  <div id="app-container" class="min-h-screen bg-gray-100">
    <router-view />
  </div>
</template>

<script setup>
// import { provide } from 'vue';
// import axios from 'axios';
// provide('axios', axios); // Provide axios for Composition API if needed
</script>

<style>
/* Basic global styles can go here if not using Tailwind extensively for base styles */
body {
  font-family: 'Inter', sans-serif;
  margin: 0;
}

#app-container {
  /* You can add global container styles here */
}
</style> 