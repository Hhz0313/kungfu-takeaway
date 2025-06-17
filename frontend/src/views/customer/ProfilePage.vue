<template>
  <div class="bg-gradient-to-br from-yellow-50 via-red-50 to-rose-100 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      <!-- Header -->
      <header class="text-center mb-10 animate-fade-in-down">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-red-600">
            个人中心
          </span>
        </h1>
        <p class="mt-3 text-base text-gray-500 sm:text-lg">管理你的账户信息，开启美味生活</p>
      </header>
      
      <!-- Main Content: Single Column Layout -->
      <div class="max-w-3xl mx-auto space-y-8">
        
        <!-- User Info Card -->
        <div class="card animate-fade-in-up">
          <div class="p-6 flex items-center space-x-6">
            <div class="flex-shrink-0">
                <div class="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-white font-bold text-5xl shadow-lg ring-4 ring-white/50">
                {{ user.username?.charAt(0).toUpperCase() }}
                </div>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-800">{{ user.username }}</h2>
              <p class="text-sm text-gray-500 mt-1 min-h-[20px]">{{ editableUser.bio || '这家伙很酷，什么也没留下...' }}</p>
              <div v-if="user.created_at" class="mt-3 flex items-center text-gray-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" /></svg>
                <span>注册于 {{ new Date(user.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
          
        <!-- Wallet Card -->
        <div class="card animate-fade-in-up animation-delay-200">
          <h3 class="card-header">我的钱包</h3>
          <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div class="text-center border-b sm:border-b-0 sm:border-r border-gray-200/80 pb-6 sm:pb-0 sm:pr-6">
              <p class="text-sm text-gray-500">当前余额</p>
              <p class="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-500 my-1">¥{{ parseFloat(user.balance || 0).toFixed(2) }}</p>
            </div>
            <form @submit.prevent="recharge" class="space-y-4">
              <label for="rechargeAmount" class="form-label text-center sm:text-left">账户充值</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">¥</span>
                </div>
                <input type="number" id="rechargeAmount" v-model.number="rechargeAmount" min="1" step="0.01" required class="form-input pl-7" placeholder="输入金额">
              </div>
              <button type="submit" class="btn-primary w-full">确认充值</button>
            </form>
          </div>
        </div>

        <!-- Edit Profile Card -->
        <div class="card animate-fade-in-up animation-delay-300">
          <h3 class="card-header">编辑个人资料</h3>
          <form @submit.prevent="updateProfile" class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="gender" class="form-label">性别</label>
                <select id="gender" v-model="editableUser.gender" class="form-input">
                  <option value="private">不透露</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div>
                <label for="birth_date" class="form-label">出生日期</label>
                <input type="date" id="birth_date" v-model="editableUser.birth_date" class="form-input">
              </div>
              <div class="sm:col-span-2">
                <label for="email" class="form-label">邮箱</label>
                <input type="email" id="email" v-model="editableUser.email" class="form-input" placeholder="your@email.com">
              </div>
              <div class="sm:col-span-2">
                <label for="phone" class="form-label">电话</label>
                <input type="tel" id="phone" v-model="editableUser.phone_number" class="form-input" placeholder="123-4567-8901">
              </div>
                <div class="sm:col-span-2">
                <label for="bio" class="form-label">个性签名</label>
                <textarea id="bio" v-model="editableUser.bio" rows="2" class="form-input" placeholder="能吃是福！"></textarea>
              </div>
            </div>
            <div class="pt-2 flex justify-end">
              <button type="submit" class="btn-primary">保存资料</button>
            </div>
          </form>
        </div>
        
        <!-- Security Card -->
        <div class="card animate-fade-in-up animation-delay-400">
          <h3 class="card-header">安全设置</h3>
          <form @submit.prevent="changePassword" class="p-6 space-y-4">
              <div>
              <label for="oldPassword" class="form-label">旧密码</label>
              <input type="password" id="oldPassword" v-model="passwordForm.oldPassword" required class="form-input" placeholder="请输入当前密码">
            </div>
            <div>
              <label for="newPassword" class="form-label">新密码</label>
              <input type="password" id="newPassword" v-model="passwordForm.newPassword" required class="form-input" placeholder="请输入新密码（至少6位）">
            </div>
            <div>
              <label for="confirmPassword" class="form-label">确认新密码</label>
              <input type="password" id="confirmPassword" v-model="passwordForm.confirmPassword" required class="form-input" placeholder="请再次输入新密码">
            </div>
            <div class="pt-2">
              <button type="submit" class="btn-danger w-full">修改密码</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Toast Notification -->
        <div v-if="notification.message" 
            :class="[notification.success ? 'bg-green-500' : 'bg-red-500', 'fixed bottom-10 right-10 text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 transform animate-fade-in-up']"
            role="alert">
        <p>{{ notification.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const user = ref({});
const editableUser = ref({ gender: 'private', bio: '' }); // Initialize with defaults
const rechargeAmount = ref(null);

const passwordForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' });
const notification = reactive({ message: '', success: false });

const showNotification = (message, success = true, duration = 3000) => {
  notification.message = message;
  notification.success = success;
  setTimeout(() => { notification.message = ''; }, duration);
};

const fetchUserProfile = async () => {
  try {
    const { data } = await axios.get('/api/users/profile');
    user.value = data;
    if (data.birth_date) {
        data.birth_date = data.birth_date.split('T')[0];
    }
    // Ensure bio is not null to prevent issues with controlled/uncontrolled components
    data.bio = data.bio || '';
    editableUser.value = { ...data };
  } catch (error) {
    showNotification('获取用户信息失败', false);
  }
};

const updateProfile = async () => {
  try {
    const { data } = await axios.put('/api/users/profile', editableUser.value);
    user.value = data.user;
    if (user.value.birth_date) {
        user.value.birth_date = user.value.birth_date.split('T')[0];
    }
    user.value.bio = user.value.bio || '';
    editableUser.value = { ...user.value };
    localStorage.setItem('user', JSON.stringify({id: user.value.id, username: user.value.username, role: user.value.role}));
    showNotification('资料更新成功！', true);
  } catch (error) {
    showNotification(error.response?.data?.message || '更新失败', false);
  }
};

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    return showNotification('新密码两次输入不一致', false);
  }
  if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
    return showNotification('新密码长度不能少于6位', false);
  }
  try {
    const { data } = await axios.put('/api/users/password', passwordForm);
    showNotification(data.message, true);
    Object.keys(passwordForm).forEach(k => passwordForm[k] = '');
  } catch (error) {
    showNotification(error.response?.data?.message || '密码修改失败', false);
  }
};

const recharge = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    return showNotification('请输入有效的充值金额', false);
  }
  try {
    const { data } = await axios.post('/api/users/recharge', { amount: rechargeAmount.value });
    user.value.balance = data.newBalance;
    showNotification(`充值成功！当前余额 ¥${data.newBalance.toFixed(2)}`, true);
    rechargeAmount.value = null;
  } catch (error) {
    showNotification(error.response?.data?.message || '充值失败', false);
  }
};

onMounted(fetchUserProfile);
</script>

<style scoped>
.card {
  @apply bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-gray-200/60;
}
.card-header {
  @apply px-6 py-4 border-b border-gray-200/60 text-lg font-semibold text-gray-800 bg-gray-50/30;
}
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1.5;
}
.form-input {
  @apply block w-full border-gray-300/70 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 ease-in-out;
}
.btn-primary {
  @apply px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-lg shadow-md hover:from-yellow-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105;
}
.btn-danger {
   @apply px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg shadow-md hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105;
}

@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out forwards;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
.animation-delay-200 { animation-delay: 150ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-400 { animation-delay: 450ms; }
</style> 