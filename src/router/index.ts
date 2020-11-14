import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { store } from '@/store';
import Tabs from '../views/Tabs.vue'

const routes: Array<RouteRecordRaw> = [
  // Redirect index page to Discover route
  {
    path: '/',
    redirect: '/tabs/discover'
  },
  // Authentication routes
  {
    path: '/auth/login',
    component: () => import('@/views/Auth/Login.vue')
  },
  // Main page routes
  {
    path: '/tabs/',
    component: Tabs,
    children: [
      {
        path: '',
        redirect: 'discover'
      },
      {
        path: 'discover',
        component: () => import('@/views/Discover.vue')
      },
      {
        path: 'wallet',
        component: () => import('@/views/Wallet/Warning.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/Profile/Overview.vue')
      }
    ]
  },
  {
    path: '/services/qr',
    component: () => import('@/views/Services/QRCode/Scan.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Check if the user is already logged in.
router.beforeEach((to, from, next) => {
  const loggedIn = store.getters.isUserLoggedIn;

  if (loggedIn) {
    console.log("User logged in!")
    next();
  } else {
    if (to.path === '/auth/login') {
      console.log("User not logged in, but is going to path anyway!")
      next();
    } else {
      console.log("User is not logged in, but was trying to visit a restricted resource!")
      next('/auth/login');
    }
  }
})

export default router
