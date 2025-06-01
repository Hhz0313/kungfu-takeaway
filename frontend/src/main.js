import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // To be created
import axios from 'axios';
import './style.css'; // Global styles + Tailwind

// Axios configuration
// axios.defaults.baseURL = 'http://localhost:3000/api'; // Default API base URL for backend
// Rely on Vite proxy and component-specific API_BASE_URL or relative paths like /api/resource

const app = createApp(App);

app.use(router); // To be created

// Make axios available globally via this.$http (Options API) or inject (Composition API)
app.config.globalProperties.$http = axios;

app.mount('#app'); 