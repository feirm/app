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
  const rootKey = Account.getRootKey();

  // TODO: This should be reconsidered at a later date for offline usage...
  // It is possible the account root key is present, but the user is not logged in.
  // In this case, request for a new a authentication token.
  if (rootKey !== undefined && !loggedIn) {
    // Reconstruct the identity keypair
    const keypair = await Account.deriveIdentityKeypair(rootKey);

    // Fetch and sign the authentication token for the username
    const loginToken = await(await tatsuyaService.getLoginToken(username)).data as AuthenticationToken;
    const signedToken = await Account.signAuthenticationToken(keypair, loginToken);
    signedToken.username = username;

    // Submit signed token to API to get a session
    const session = await tatsuyaService.loginAccount(signedToken);

    // Update Vuex to store JWT
    store.dispatch("login", session.data);

    // Check to see if authed, and if so
    // redirect the user to where they wanted to go
    if (store.getters.isUserLoggedIn) {
      return next();
    }

    return next("/auth/login");
  }

  // If the users encrypted account is present, they are not logged in
  // then prompt for account decryption and set root key in memory
  if (encryptedAccount.username !== undefined && !loggedIn) {
    console.log("Encrypted account is present and not logged in.")
    const passwordPrompt = await modalController.create({
      component: PasswordPrompt,
    });

    passwordPrompt.present();

    // We should have an updated root key
    const updatedRootKey = Account.getRootKey();
    console.log('Please:', updatedRootKey);

    return next();
  }

  // If all else fails
  // If the encrypted account is not present and the user is not logged in, redirect to login
  if (!encryptedAccount && !loggedIn) {
    console.log("Encrypted account not present and not logged in.")
    return next("/auth/login")
  }
  
  // Determine what happens depending on if the user is logged in
  if (authRequired && !store.getters.isUserLoggedIn) {
    next("/auth/login");
  } else if(Account.getRootKey() !== undefined) {
    next();
  }
});

export default router;
