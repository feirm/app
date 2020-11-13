import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Tabs from '../views/Tabs.vue'

const routes: Array<RouteRecordRaw> = [
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
        path: 'tab2',
        component: () => import('@/views/Tab2.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3.vue')
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

export default router
