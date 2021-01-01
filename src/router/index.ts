import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { store } from "@/store";
import Tabs from "../views/Tabs.vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import * as nacl from "tweetnacl";
import bufferToHex from "@/lib/bufferToHex";

const routes: Array<RouteRecordRaw> = [
  // Redirect index page to Discover route
  {
    path: "/",
    redirect: "/tabs/discover",
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
    path: "/auth/login/pin",
    component: () => import("@/views/Auth/Login/PIN.vue"),
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
  {
    path: "/auth/register/pin",
    component: () => import("@/views/Auth/Register/PIN.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/auth/register/confirmPin",
    component: () => import("@/views/Auth/Register/ConfirmPIN.vue"),
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
        redirect: "discover",
      },
      {
        path: "discover",
        component: () => import("@/views/Discover.vue"),
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
        path: "wallet/:id/:coin/transactions",
        component: () => import("@/views/Wallet/Transactions.vue"),
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
    path: "/wallet/backupSeed",
    component: () => import("@/views/Wallet/BackupSeed.vue"),
  },
  {
    path: "/wallet/addCoin",
    component: () => import("@/views/Wallet/AddCoin.vue"),
  },

  // New PWA Version
  {
    path: "/update",
    component: () => import("@/views/Update.vue"),
    meta: {
      requiresAuth: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Check if the user is already logged in.
router.beforeEach(async (to, from, next) => {
  const loggedIn = store.getters.isUserLoggedIn;
  const authRequired = to.matched.some((route) => route.meta.requiresAuth);

  // If the user isn't logged in, but has a root key, get a new session token
  const rootKey = store.getters.getRootKey;
  const username = store.getters.getUsername;

  if (!loggedIn && rootKey) {
    // Reconstruct the identity key from the root key
    const identityKeyString = rootKey + "identity";
    const identityKey = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(identityKeyString)
    );

    // Derive the signing ed25519 keypair from identityKey
    const rootKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(identityKey));

    await tatsuyaService
      .getLoginToken(username)
      .then(async (res) => {
        // Create signature
        const signature = nacl.sign.detached(
          new TextEncoder().encode(res.data.nonce),
          rootKeyPair.secretKey
        );

        // Construct the login/new session payload
        const payload = {
          id: res.data.id,
          username: username,
          signature: bufferToHex(signature),
        };

        // Submit the signed payload and expect to receive a new session token
        await tatsuyaService.loginAccount(payload).then((res) => {
          // Construct the session object
          const session = {
            rootKey: rootKey,
            sessionToken: res.data.sessionToken,
            username: res.data.username,
          };

          // Save the session token
          store.dispatch("login", session);

          // Check to see if authed, and if so, continue
          if (store.getters.isUserLoggedIn) {
            next();
          }
        });
      })
      .catch((e) => {
        if (e.status === 400) {
          // User might not exist (maybe database reset), so return them to login page
          return next("/");
        }
      });
  }

  if (authRequired && !loggedIn) {
    next("/auth/login");
  } else {
    next();
  }
});

export default router;
