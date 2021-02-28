import { store } from "@/store";
import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

import Tabs from "../views/Tabs.vue";
import PasswordPrompt from "@/components/Auth/Password.vue";

import Account from "@/class/account";
import tatsuyaService from "@/apiService/tatsuyaService";
import { AuthenticationToken } from "@/models/account";
import { modalController } from "@ionic/vue";

const routes: Array<RouteRecordRaw> = [
  // Redirect index page to Discover route
  {
    path: "/",
    redirect: "/tabs/wallet",
  },
  // Authentication routes
  {
    path: "/auth/login",
    component: () => import("@/views/Auth/Login/Login.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/auth/register",
    component: () => import("@/views/Auth/Register/Username.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/auth/register/password",
    component: () => import("@/views/Auth/Register/Password.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  // Main page routes
  {
    path: "/tabs/",
    component: Tabs,
    meta: {
      requiresAuth: true,
    },
    children: [
      {
        path: "",
        redirect: "wallet",
      },

      // Wallet
      {
        path: "wallet",
        component: () => import("@/views/Wallet/Overview.vue"),
      },
      {
        path: "wallet/:id/:coin",
        component: () => import("@/views/Wallet/Details.vue"),
      },
      {
        path: "wallet/:id/:coin/settings",
        component: () => import("@/views/Wallet/Settings/Overview.vue"),
      },
      {
        path: "wallet/:id/:coin/settings/showXpub",
        component: () => import("@/views/Wallet/Settings/ShowXPUB.vue"),
      },

      // Marketplace
      {
        path: "marketplace",
        component: () => import("@/views/Marketplace/Overview.vue"),
      },

      // Account
      {
        path: "contacts",
        component: () => import("@/views/Contacts/Contacts.vue"),
      },
      {
        path: "profile",
        component: () => import("@/views/Profile/Overview.vue"),
      },

      // App settings
      {
        path: "settings/version",
        component: () => import("@/views/Settings/Version.vue"),
      },
      {
        path: "settings/deviceSecurity",
        component: () => import("@/views/Settings/DeviceSecurity.vue")
      }
    ],
  },
  // Wallet Service
  {
    path: "/wallet/getStarted",
    component: () => import("@/views/Wallet/GetStarted.vue"),
  },
  {
    path: "/wallet/newSeed",
    component: () => import("@/views/Wallet/NewSeed.vue"),
  },
  {
    path: "/wallet/recovery",
    component: () => import("@/views/Wallet/Setup/Recovery.vue"),
  },
  {
    path: "/wallet/addCoin",
    component: () => import("@/views/Wallet/AddCoin.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// TODO: Check that the user's root key or JWT is present
router.beforeEach(async (to, from, next) => {
  const loggedIn = store.getters.isUserLoggedIn;
  const authRequired = to.matched.some((route) => route.meta.requiresAuth);

  // Check to see if the account and root key exists
  const username = localStorage.getItem("username")!;
  const encryptedAccount = await Account.fetchAccountFromIDB(username);

  // If the user is not logged in (don't have a root key in memory), or have an account in storage but auth is required for this route
  // then redirect them to login
  if (!store.getters.isUserLoggedIn && authRequired && !encryptedAccount.rootPublicKey) {
    next("/auth/login");
  }

  // If the users encrypted account is present, they are not logged in and auth is required for this route
  // then prompt for account decryption and set root key in memory
  if (encryptedAccount.rootPublicKey && !loggedIn && authRequired) {
    const passwordPrompt = await modalController.create({
      component: PasswordPrompt,
    });

    passwordPrompt.present();
  }

  // For some reason keeping this in works...
  next();
});

export default router;
