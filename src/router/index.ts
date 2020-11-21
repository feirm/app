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
    component: () => import('@/views/Auth/Login.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/login/2fa',
    component: () => import('@/views/Auth/TwoFactor.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/register',
    component: () => import('@/views/Auth/Register/Username.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/register/email',
    component: () => import('@/views/Auth/Register/Email.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/auth/register/password',
    component: () => import('@/views/Auth/Register/Password.vue'),
    meta: {
      requiresAuth: false
    }
  },
  // Main page routes
  {
    path: '/tabs/',
    component: Tabs,
    meta: {
      requiresAuth: true
    },
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
        component: () => import('@/views/Wallet/Overview.vue')
      },
      {
        path: 'profile',
        component: () => import('@/views/Profile/Overview.vue')
      }
    ]
  },
  {
    path: '/services/qr',
    component: () => import('@/views/Services/QRCode/Scan.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/update',
    component: () => import('@/views/Update.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Check if the user is already logged in.
router.beforeEach((to, from, next) => {
  const loggedIn = store.getters.isUserLoggedIn;
  const authRequired = to.matched.some((route) => route.meta.requiresAuth);

  if (authRequired && !loggedIn) {
    next("/auth/login")
  } else {
    next();
  }
})

export default router
