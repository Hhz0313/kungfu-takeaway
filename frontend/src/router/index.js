import { createRouter, createWebHistory } from 'vue-router';

// --- Layouts ---
import AdminLayout from '../layouts/AdminLayout.vue';
import CustomerLayout from '../layouts/CustomerLayout.vue'; // Import CustomerLayout

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

// --- Admin Pages (Lazy loaded) ---
const AdminLoginPage = () => import('../views/admin/AdminLoginPage.vue');
const AdminDashboardPage = () => import('../views/admin/AdminDashboardPage.vue');
const AdminCategoryPage = () => import('../views/admin/AdminCategoryPage.vue');
const AdminDishPage = () => import('../views/admin/AdminDishPage.vue');
const AdminComboPage = () => import('../views/admin/AdminComboPage.vue');
const AdminOrderProcessingPage = () => import('../views/admin/AdminOrderProcessingPage.vue');
const AdminStatisticsPage = () => import('../views/admin/AdminStatisticsPage.vue');

const routes = [
  // --- Customer Routes (using CustomerLayout) ---
  {
    path: '/',
    component: CustomerLayout,
    children: [
      { path: '', name: 'HomePage', component: HomePage }, // HomePage will redirect to MenuPage
      { path: 'menu', name: 'MenuPage', component: MenuPage },
      { path: 'dish/:id', name: 'DishDetailPage', component: DishDetailPage, props: true },
      { path: 'cart', name: 'CartPage', component: CartPage },
      { path: 'my-addresses', name: 'AddressPage', component: AddressPage },
      { path: 'checkout', name: 'CheckoutPage', component: CheckoutPage },
      { path: 'order-success/:orderId', name: 'OrderSuccessPage', component: OrderSuccessPage, props: true },
      { path: 'my-orders', name: 'OrderHistoryPage', component: OrderHistoryPage },
      { path: 'my-orders/:orderId', name: 'OrderDetailPage', component: OrderDetailPage, props: true },
    ]
  },

  // --- Admin Routes ---
  { 
    path: '/admin/login', 
    name: 'AdminLogin', 
    component: AdminLoginPage 
  },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
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

// Navigation Guards (to be implemented later)
// router.beforeEach((to, from, next) => {
//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
//   const requiresAdminAuth = to.matched.some(record => record.meta.requiresAdminAuth);
//   const isAuthenticated = false; // Replace with actual auth check
//   const isAdmin = false; // Replace with actual admin check

//   if (requiresAdminAuth && !isAdmin) {
//     next({ name: 'AdminLogin' });
//   } else if (requiresAdminAuth && !isAuthenticated) { // Admin also needs to be authenticated
//     next({ name: 'AdminLogin' });
//   } else if (requiresAuth && !isAuthenticated) {
//     next({ name: 'HomePage' }); // Or a login page for customers
//   } else {
//     next();
//   }
// });

export default router; 