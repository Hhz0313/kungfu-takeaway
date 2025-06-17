import { createRouter, createWebHistory } from 'vue-router';

// --- Layouts ---
import AdminLayout from '../layouts/AdminLayout.vue';
import CustomerLayout from '../layouts/CustomerLayout.vue';

// --- Auth Pages ---
import LoginChoicePage from '../views/LoginChoice.vue';
const LoginPage = () => import('../views/customer/LoginPage.vue');
const RegisterPage = () => import('../views/customer/RegisterPage.vue');
const AdminLoginPage = () => import('../views/admin/AdminLoginPage.vue');

// --- Customer Pages (Lazy loaded) ---
const HomePage = () => import('../views/customer/HomePage.vue');
const MenuPage = () => import('../views/customer/MenuPage.vue');
const DishDetailPage = () => import('../views/customer/DishDetailPage.vue');
const CartPage = () => import('../views/customer/CartPage.vue');
const AddressPage = () => import('../views/customer/AddressPage.vue');
const CheckoutPage = () => import('../views/customer/CheckoutPage.vue');
const OrderSuccessPage = () => import('../views/customer/OrderSuccessPage.vue');
const OrderHistoryPage = () => import('../views/customer/OrderHistoryPage.vue');
const OrderDetailPage = () => import('../views/customer/OrderDetailPage.vue');
const ProfilePage = () => import('../views/customer/ProfilePage.vue');
const AiAssistantPage = () => import('../views/customer/AiAssistantPage.vue');

// --- Admin Pages (Lazy loaded) ---
const AdminDashboardPage = () => import('../views/admin/AdminDashboardPage.vue');
const AdminCategoryPage = () => import('../views/admin/AdminCategoryPage.vue');
const AdminDishPage = () => import('../views/admin/AdminDishPage.vue');
const AdminComboPage = () => import('../views/admin/AdminComboPage.vue');
const AdminOrderProcessingPage = () => import('../views/admin/AdminOrderProcessingPage.vue');
const AdminStatisticsPage = () => import('../views/admin/AdminStatisticsPage.vue');

const routes = [
  // --- Entry and Auth Routes ---
  { path: '/', name: 'LoginChoice', component: LoginChoicePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/admin/login', name: 'AdminLogin', component: AdminLoginPage },

  // --- Customer Routes (using CustomerLayout) ---
  {
    path: '/home',
    component: CustomerLayout,
    redirect: '/home/menu',
    children: [
      { path: '', name: 'HomePage', component: HomePage },
      { path: 'menu', name: 'MenuPage', component: MenuPage },
      { path: 'dish/:id', name: 'DishDetailPage', component: DishDetailPage, props: true },
      { path: 'cart', name: 'CartPage', component: CartPage, meta: { requiresAuth: true } },
      { path: 'my-addresses', name: 'AddressPage', component: AddressPage, meta: { requiresAuth: true } },
      { path: 'checkout', name: 'CheckoutPage', component: CheckoutPage, meta: { requiresAuth: true } },
      { path: 'order-success/:orderId', name: 'OrderSuccessPage', component: OrderSuccessPage, props: true, meta: { requiresAuth: true } },
      { path: 'my-orders', name: 'OrderHistoryPage', component: OrderHistoryPage, meta: { requiresAuth: true } },
      { path: 'my-orders/:orderId', name: 'OrderDetailPage', component: OrderDetailPage, props: true, meta: { requiresAuth: true } },
      { path: 'profile', name: 'ProfilePage', component: ProfilePage, meta: { requiresAuth: true } },
      { path: 'ai-assistant', name: 'AiAssistantPage', component: AiAssistantPage, meta: { requiresAuth: true } },
    ]
  },

  // --- Admin Routes ---
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboardPage },
      { path: 'categories', name: 'AdminCategoryPage', component: AdminCategoryPage },
      { path: 'dishes', name: 'AdminDishPage', component: AdminDishPage },
      { path: 'combos', name: 'AdminComboPage', component: AdminComboPage },
      { path: 'orders', name: 'AdminOrderProcessingPage', component: AdminOrderProcessingPage },
      { path: 'stats', name: 'AdminStatisticsPage', component: AdminStatisticsPage }
    ]
  },

  // Catch-all 404 (optional)
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFoundPage.vue') }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('user-token');
  const adminToken = localStorage.getItem('admin-token');

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAdmin) {
    if (adminToken) {
      next();
    } else {
      next('/admin/login');
    }
  } else if (requiresAuth) {
    if (userToken) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

export default router; 