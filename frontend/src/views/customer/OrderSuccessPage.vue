<template>
  <div class="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center flex-1 text-center">
    <div class="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full">
      <svg class="w-20 h-20 md:w-24 md:h-24 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-3">下单成功！</h1>
      <p class="text-gray-600 text-lg mb-6">
        感谢您的惠顾，我们将尽快为您准备餐点。
      </p>
      <div class="bg-gray-100 p-4 rounded-lg mb-8">
        <p class="text-sm text-gray-500">您的订单号是:</p>
        <p class="text-xl font-semibold text-blue-600 tracking-wider">{{ orderId }}</p>
      </div>
      
      <div class="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
        <router-link 
          :to="{ name: 'OrderHistoryPage' }" 
          class="block w-full sm:w-auto btn-secondary-themed"
        >
          查看订单历史
        </router-link>
        <router-link 
          :to="{ name: 'MenuPage' }" 
          class="block w-full sm:w-auto btn-primary-themed"
        >
          继续点餐
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderId = computed(() => route.params.orderId);

// Optional: Fetch minimal order details if needed in the future
// onMounted(async () => {
//   if (orderId.value) {
//     // try {
//     //   const response = await axios.get(`/api/orders/${orderId.value}`);
//     //   // Store and display some minimal details
//     // } catch (error) {
//     //   console.error('Failed to fetch order details for success page:', error);
//     // }
//   }
// });
</script>

<style scoped>
.btn-primary-themed {
  /* Green to align with primary positive actions like add to cart, place order */
  @apply bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-base;
}

.btn-secondary-themed {
  /* A common secondary button style - could be gray or an outline */
  @apply bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 text-base;
  /* Alternative outline style, if preferred over gray:
  @apply bg-transparent hover:bg-blue-50 text-blue-600 font-semibold py-3 px-6 border border-blue-500 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-base;
  */
}
</style> 