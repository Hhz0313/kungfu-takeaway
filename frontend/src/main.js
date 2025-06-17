import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // To be created
import axios from 'axios';
import './style.css'; // Global styles + Tailwind

// Axios configuration
// 设置axios请求拦截器，在header中添加token
axios.interceptors.request.use(
  (config) => {
    // 根据路由来判断应该使用哪个 token
    // window.location.pathname 可以获取当前的路径
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    
    let token = null;
    if (isAdminRoute) {
      token = localStorage.getItem('admin-token');
    } else {
      token = localStorage.getItem('user-token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Rely on Vite proxy and component-specific API_BASE_URL or relative paths like /api/resource

const app = createApp(App);

app.use(router); // To be created

// Make axios available globally via this.$http (Options API) or inject (Composition API)
app.config.globalProperties.$http = axios;

app.mount('#app'); 