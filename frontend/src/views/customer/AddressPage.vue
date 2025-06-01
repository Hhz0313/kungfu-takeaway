<template>
  <div class="container mx-auto p-4 md:p-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">管理收货地址</h1>

    <div class="mb-6 text-right">
      <button @click="openModal(null)" class="btn-primary">
        <span class="mr-2">&#43;</span> 添加新地址
      </button>
    </div>

    <!-- Messages -->
    <div v-if="isLoading" class="text-center py-10"><p class="text-lg text-gray-600">加载地址中...</p></div>
    <div v-if="feedback.message" 
         :class="[feedback.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700', 'border-l-4 p-4 mb-6 rounded-md']" 
         role="alert">
      <p>{{ feedback.message }}</p>
    </div>

    <!-- Addresses List -->
    <div v-if="!isLoading && addresses.length === 0 && !feedback.message" class="text-center py-10 bg-white shadow-md rounded-lg">
      <p class="text-xl text-gray-500">您还没有添加任何收货地址。</p>
      <p class="mt-2 text-sm text-gray-400">点击上方按钮添加一个吧！</p>
    </div>

    <div v-if="!isLoading && addresses.length > 0" class="space-y-6">
      <div v-for="address in addresses" :key="address.id" 
           class="bg-white p-6 rounded-lg shadow-md border-2"
           :class="address.is_default ? 'border-blue-500' : 'border-gray-200'">
        
        <div class="flex justify-between items-start mb-3">
            <div>
                <p class="font-semibold text-lg text-gray-800">{{ address.recipient_name }}</p>
                <p class="text-sm text-gray-600">{{ address.phone_number }}</p>
            </div>
            <span v-if="address.is_default" class="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">默认地址</span>
        </div>

        <p class="text-gray-700 leading-relaxed">
          楼宇: {{ address.building_name }}<br>
          房间: {{ address.room_details }}
        </p>

        <div class="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 items-center">
          <button @click="openModal(address)" class="btn-secondary-sm">编辑</button>
          <button @click="confirmDeleteAddress(address.id)" class="btn-danger-sm">删除</button>
          <button v-if="!address.is_default" @click="setDefaultAddress(address.id)" class="btn-outline-sm">
            设为默认
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Address Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="handleSubmitAddress">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-medium text-gray-900 mb-6">
                {{ editingAddress ? '编辑地址' : '添加新地址' }}
              </h3>
              <div class="space-y-4">
                <div>
                  <label for="recipientName" class="label-form">收件人姓名 <span class="text-red-500">*</span></label>
                  <input type="text" v-model="currentAddress.recipient_name" id="recipientName" required class="input-form"/>
                </div>
                <div>
                  <label for="phoneNumber" class="label-form">手机号码 <span class="text-red-500">*</span></label>
                  <input type="tel" v-model="currentAddress.phone_number" id="phoneNumber" required pattern="[0-9]{11}" placeholder="例如: 13800138000" class="input-form"/>
                </div>
                <div>
                  <label for="buildingName" class="label-form">选择楼宇 <span class="text-red-500">*</span></label>
                  <select v-model="currentAddress.building_name" id="buildingName" required class="input-form">
                    <option disabled value="">请选择楼宇/区域</option>
                    <optgroup label="公寓区">
                      <option v-for="i in 16" :key="`A${i}`" :value="`A${String(i).padStart(2, '0')}公寓`">A{{ String(i).padStart(2, '0') }}公寓</option>
                    </optgroup>
                    <optgroup label="教学楼/其他">
                      <option value="正心楼">正心楼</option>
                      <option value="诚意楼">诚意楼</option>
                      <option value="经管楼">经管楼</option>
                      <option value="格物楼">格物楼</option>
                      <option value="成教楼">成教楼</option>
                      <option value="综合楼">综合楼</option>
                      <!-- Add other common buildings if needed -->
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label for="roomDetails" class="label-form">详细房间号 (例如: 501室) <span class="text-red-500">*</span></label>
                  <input type="text" v-model="currentAddress.room_details" id="roomDetails" required placeholder="例如: 501室 或 教师办公室" class="input-form"/>
                </div>
                <div class="flex items-center mt-2">
                    <input type="checkbox" v-model="currentAddress.is_default" id="isDefault" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label for="isDefault" class="ml-2 block text-sm text-gray-900">设为默认地址</label>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button type="submit" class="btn-primary w-full sm:w-auto" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存地址' }}
              </button>
              <button @click="closeModal" type="button" class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const DUMMY_USER_ID = "1"; // Replace with actual user ID management

const addresses = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const feedback = reactive({ message: '', type: '' }); // type: 'success' or 'error'

const showModal = ref(false);
const editingAddress = ref(null); // Holds the address object being edited, or null for new
const currentAddress = reactive({
  id: null,
  recipient_name: '',
  phone_number: '',
  building_name: '',
  room_details: '',
  is_default: false,
});

const clearFeedback = () => {
  feedback.message = '';
  feedback.type = '';
};

const fetchAddresses = async () => {
  isLoading.value = true;
  clearFeedback();
  try {
    const response = await axios.get(`${API_BASE_URL}/addresses?user_id=${DUMMY_USER_ID}`);
    if (response.data && response.data.code === 0) {
      addresses.value = response.data.data;
    } else {
      throw new Error(response.data.message || '获取地址列表失败');
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    feedback.message = error.response?.data?.message || error.message || '无法加载地址信息。';
    feedback.type = 'error';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAddresses);

const resetCurrentAddress = () => {
  currentAddress.id = null;
  currentAddress.recipient_name = '';
  currentAddress.phone_number = '';
  currentAddress.building_name = '';
  currentAddress.room_details = '';
  currentAddress.is_default = false;
};

const openModal = (addressToEdit = null) => {
  clearFeedback();
  if (addressToEdit) {
    editingAddress.value = addressToEdit;
    Object.assign(currentAddress, addressToEdit);
  } else {
    editingAddress.value = null;
    resetCurrentAddress();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingAddress.value = null;
  resetCurrentAddress();
};

const handleSubmitAddress = async () => {
  isSubmitting.value = true;
  clearFeedback();
  
  // Basic validation
  if (!currentAddress.recipient_name.trim() || 
      !currentAddress.phone_number.trim() || 
      !currentAddress.building_name || 
      !currentAddress.room_details.trim()
      ) {
      feedback.message = '收件人姓名、手机号、楼宇和房间号为必填项。';
      feedback.type = 'error';
      isSubmitting.value = false;
      return;
  }
  if (!/^[0-9]{11}$/.test(currentAddress.phone_number)) {
      feedback.message = '请输入有效的11位手机号码。';
      feedback.type = 'error';
      isSubmitting.value = false;
      return;
  }

  const payload = { ...currentAddress, user_id: DUMMY_USER_ID };
  // Remove id from payload if it's a new address, backend might not expect it or create a new one
  if (!editingAddress.value) delete payload.id; 

  try {
    let response;
    if (editingAddress.value) {
      response = await axios.put(`${API_BASE_URL}/addresses/${currentAddress.id}`, payload);
    } else {
      response = await axios.post(`${API_BASE_URL}/addresses`, payload);
    }

    if (response.data && response.data.code === 0) {
      feedback.message = editingAddress.value ? '地址更新成功！' : '地址添加成功！';
      feedback.type = 'success';
      closeModal();
      await fetchAddresses(); // Refresh list
      setTimeout(() => clearFeedback(), 3000); // Auto-clear feedback
    } else {
      throw new Error(response.data.message || (editingAddress.value ? '更新地址失败' : '添加地址失败'));
    }
  } catch (error) {
    console.error("Error submitting address:", error);
    feedback.message = error.response?.data?.message || error.message || '操作失败，请重试。';
    feedback.type = 'error';
    setTimeout(() => clearFeedback(), 5000); // Longer timeout for errors
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDeleteAddress = (addressId) => {
    if (window.confirm('确定要删除这个地址吗？')) {
        deleteAddress(addressId);
    }
};

const deleteAddress = async (addressId) => {
  isLoading.value = true; // Could use a more specific loading for the item being deleted
  clearFeedback();
  try {
    const response = await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, { data: { user_id: DUMMY_USER_ID } });
    if (response.data && response.data.code === 0) {
      feedback.message = '地址删除成功！';
      feedback.type = 'success';
      await fetchAddresses(); // Refresh list
      setTimeout(() => clearFeedback(), 3000);
    } else {
      throw new Error(response.data.message || '删除地址失败');
    }
  } catch (error) {
    console.error("Error deleting address:", error);
    feedback.message = error.response?.data?.message || error.message || '删除地址失败，请重试。';
    feedback.type = 'error';
    setTimeout(() => clearFeedback(), 5000);
  } finally {
    isLoading.value = false;
  }
};

const setDefaultAddress = async (addressId) => {
  isLoading.value = true;
  clearFeedback();
  try {
    const response = await axios.patch(`${API_BASE_URL}/addresses/${addressId}/default`, { user_id: DUMMY_USER_ID });
    if (response.data && response.data.code === 0) {
      feedback.message = '默认地址设置成功！';
      feedback.type = 'success';
      await fetchAddresses(); // Refresh list to show new default
      setTimeout(() => clearFeedback(), 3000);
    } else {
      throw new Error(response.data.message || '设置默认地址失败');
    }
  } catch (error) {
    console.error("Error setting default address:", error);
    feedback.message = error.response?.data?.message || error.message || '设置默认地址失败，请重试。';
    feedback.type = 'error';
    setTimeout(() => clearFeedback(), 5000);
  } finally {
    isLoading.value = false;
  }
};

</script>

<style scoped>
.label-form {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.input-form {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm;
}
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors;
}
.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
}
.btn-secondary-sm {
  @apply px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors;
}
.btn-danger-sm {
    @apply px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors;
}
.btn-outline-sm {
    @apply px-3 py-1.5 border border-blue-500 text-xs font-medium rounded-md text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-colors;
}

</style> 