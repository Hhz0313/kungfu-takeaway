<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-800">个人中心</h1>
        <div v-if="user.role === 'admin'" class="p-2 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold">
          管理员
        </div>
      </div>

      <!-- Notifications -->
      <div v-if="notification.message" 
           :class="[notification.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700', 'border-l-4 p-4 mb-6 rounded-r-lg']" 
           role="alert">
        <p class="font-bold">{{ notification.success ? '成功' : '错误' }}</p>
        <p>{{ notification.message }}</p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button v-for="tab in tabs" :key="tab.name" @click="activeTab = tab.name"
                  :class="[activeTab === tab.name ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']">
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Basic Info Tab -->
        <div v-show="activeTab === 'profile'">
          <div class="p-6 border-b"><h2 class="text-xl font-semibold text-gray-700">基本资料</h2></div>
          <div class="p-6">
            <form @submit.prevent="updateProfile" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">用户名</label>
                  <p class="mt-1 text-lg text-gray-800 font-semibold">{{ user.username }}</p>
                </div>
                <div>
                  <label for="gender" class="block text-sm font-medium text-gray-700">性别</label>
                  <select id="gender" v-model="editableUser.gender" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="private">不透露</option>
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
                  <input type="email" id="email" v-model="editableUser.email" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700">电话</label>
                  <input type="tel" id="phone" v-model="editableUser.phone_number" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
                <div>
                  <label for="birth_date" class="block text-sm font-medium text-gray-700">出生日期</label>
                  <input type="date" id="birth_date" v-model="editableUser.birth_date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
                <div>
                  <label for="food_tags" class="block text-sm font-medium text-gray-700">吃货标签</label>
                  <input type="text" id="food_tags" v-model="editableUser.food_tags" placeholder="如：爱吃辣, 不吃香菜" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                </div>
                <div class="sm:col-span-2">
                  <label for="bio" class="block text-sm font-medium text-gray-700">个性签名</label>
                  <textarea id="bio" v-model="editableUser.bio" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
              </div>
              <div class="pt-4 flex justify-end">
                <button type="submit" class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">保存资料</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Wallet Tab -->
        <div v-show="activeTab === 'wallet'">
          <div class="p-6 border-b"><h2 class="text-xl font-semibold text-gray-700">我的钱包</h2></div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="text-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-8 shadow-lg">
              <p class="text-lg">当前余额</p>
              <p class="text-5xl font-bold tracking-tight">¥{{ parseFloat(user.balance || 0).toFixed(2) }}</p>
            </div>
            <form @submit.prevent="recharge" class="space-y-4">
              <h3 class="text-lg font-medium text-gray-800">账户充值</h3>
              <div>
                <label for="rechargeAmount" class="block text-sm font-medium text-gray-700">充值金额</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">¥</span>
                  </div>
                  <input type="number" id="rechargeAmount" v-model.number="rechargeAmount" min="1" step="0.01" required class="block w-full pl-7 pr-12 border-gray-300 rounded-md" placeholder="0.00">
                </div>
              </div>
              <button type="submit" class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">确认充值</button>
            </form>
          </div>
        </div>

        <!-- Security Tab -->
        <div v-show="activeTab === 'security'">
          <div class="p-6 border-b"><h2 class="text-xl font-semibold text-gray-700">安全设置</h2></div>
          <div class="p-6 max-w-md">
            <form @submit.prevent="changePassword" class="space-y-4">
               <div>
                <label for="oldPassword" class="block text-sm font-medium text-gray-700">旧密码</label>
                <input type="password" id="oldPassword" v-model="passwordForm.oldPassword" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              </div>
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">新密码</label>
                <input type="password" id="newPassword" v-model="passwordForm.newPassword" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">确认新密码</label>
                <input type="password" id="confirmPassword" v-model="passwordForm.confirmPassword" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              </div>
              <div class="pt-2">
                <button type="submit" class="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">修改密码</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import axios from 'axios';

const user = ref({});
const editableUser = ref({});
const activeTab = ref('profile');
const rechargeAmount = ref(null);

const tabs = [
  { name: 'profile', label: '基本资料' },
  { name: 'wallet', label: '我的钱包' },
  { name: 'security', label: '安全设置' },
];

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });
const notification = reactive({ message: '', success: false });

const showNotification = (message, success = false) => {
  notification.message = message;
  notification.success = success;
  setTimeout(() => { notification.message = ''; }, 4000);
};

const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/api/users/profile');
    user.value = response.data;
    // Format date for input[type=date] which requires YYYY-MM-DD
    if (user.value.birth_date) {
        user.value.birth_date = user.value.birth_date.split('T')[0];
    }
    editableUser.value = { ...user.value };
  } catch (error) {
    showNotification('获取用户信息失败', false);
  }
};

const updateProfile = async () => {
  try {
    const response = await axios.put('/api/users/profile', editableUser.value);
    user.value = response.data.user;
    if (user.value.birth_date) {
        user.value.birth_date = user.value.birth_date.split('T')[0];
    }
    editableUser.value = { ...user.value };
    // Also update the user info in localStorage that the layout uses
    localStorage.setItem('user', JSON.stringify({id: user.value.id, username: user.value.username, role: user.value.role}));
    showNotification('资料更新成功', true);
  } catch (error) {
    showNotification(error.response?.data?.message || '更新失败', false);
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showNotification('新密码两次输入不一致', false);
    return;
  }
  try {
    const response = await axios.put('/api/users/password', passwordForm);
    showNotification(response.data.message, true);
    Object.keys(passwordForm).forEach(k => passwordForm[k] = '');
  } catch (error) {
    showNotification(error.response?.data?.message || '密码修改失败', false);
  }
};

const recharge = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    showNotification('请输入有效的充值金额', false);
    return;
  }
  try {
    const response = await axios.post('/api/users/recharge', { amount: rechargeAmount.value });
    user.value.balance = response.data.newBalance;
    showNotification(`充值成功！当前余额 ¥${response.data.newBalance.toFixed(2)}`, true);
    rechargeAmount.value = null;
  } catch (error) {
    showNotification(error.response?.data?.message || '充值失败', false);
  }
};

onMounted(fetchUserProfile);
</script> 