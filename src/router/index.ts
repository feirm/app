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
    path: "/auth/register/email",
    component: () => import("@/views/Auth/Register/Email.vue"),
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
        path: "wallet/getStarted",
        component: () => import("@/views/Wallet/GetStarted.vue")
      },
      {
        path: "wallet/newSeed",
        component: () => import("@/views/Wallet/NewSeed.vue")
      },
      {
        path: "wallet/backupSeed",
        component: () => import("@/views/Wallet/BackupSeed.vue")
      },
      {
        path: "wallet/:id/:coin",
        component: () => import("@/views/Wallet/Details.vue")
      },
      {
        path: "wallet/:id/:coin/settings",
        component: () => import("@/views/Wallet/Settings/Settings.vue")
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
  {
    path: "/services/qr",
    component: () => import("@/views/Services/QRCode/Scan.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/services/contacts/new",
    component: () => import("@/views/Services/Contacts/New.vue"),
    meta: {
      requiresAuth: true,
    },
  },
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

  // If the user isn't logged in, check for a root key and get a new session token
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

    const res = await tatsuyaService.getLoginToken(username);

    // If the response status code is 400, then clear the state and redirect to login
    // (Something has gone wrong server side)
    if (res.status === 400) {
      store.dispatch("logout");
      return next("/auth/login");
    }

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

    const response = await tatsuyaService.loginAccount(payload);

    // Construct the session object
    const session = {
      rootKey: rootKey,
      sessionToken: response.data.sessionToken,
      username: response.data.username,
    };

    store.dispatch("login", session);

    // Continue if authed
    if (store.getters.isUserLoggedIn) {
      next();
    }
  }

  if (authRequired && !loggedIn) {
    next("/auth/login");
  } else {
    next();
  }
});

export default router;
