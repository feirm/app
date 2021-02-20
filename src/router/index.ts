import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { store } from "@/store";
import Tabs from "../views/Tabs.vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import * as nacl from "tweetnacl";
import bufferToHex from "@/lib/bufferToHex";

// Pages and Components
// Authentication
import Login from "@/views/Auth/Login/Login.vue";
import RegisterUsername from "@/views/Auth/Register/Username.vue";
import RegisterPassword from "@/views/Auth/Register/Password.vue";

// Tabs
import TabWalletOverview from "@/views/Wallet/Overview.vue";
import TabWalletDetails from "@/views/Wallet/Details.vue";
import TabWalletTransactions from "@/views/Wallet/Transactions.vue";
import TabMarketplaceOverview from "@/views/Marketplace/Overview.vue";
import TabContacts from "@/views/Contacts/Contacts.vue";

// Profile and Settings
import TabProfileOverview from "@/views/Profile/Overview.vue";
import AppVersion from "@/views/Settings/Version.vue";

// Wallet
import WalletGetStarted from "@/views/Wallet/GetStarted.vue";
import WalletNewSeed from "@/views/Wallet/NewSeed.vue";
import WalletRecovery from "@/views/Wallet/Setup/Recovery.vue";
import WalletAddCoin from "@/views/Wallet/AddCoin.vue";

// Wallet Settings
import WalletSettingsOverview from "@/views/Wallet/Settings/Overview.vue";
import WalletSettingsXpub from "@/views/Wallet/Settings/ShowXPUB.vue";

const routes: Array<RouteRecordRaw> = [
  // Redirect index page to Discover route
  {
    path: "/",
    redirect: "/tabs/wallet",
  },
  // Authentication routes
  {
    path: "/auth/login",
    component: Login,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/auth/register",
    component: RegisterUsername,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/auth/register/password",
    component: RegisterPassword,
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
        component: TabWalletOverview,
      },
      {
        path: "wallet/:id/:coin",
        component: TabWalletDetails,
      },
      {
        path: "wallet/:id/:coin/transactions",
        component: TabWalletTransactions,
      },
      {
        path: "wallet/:id/:coin/settings",
        component: WalletSettingsOverview
      },
      {
        path: "wallet/:id/:coin/settings/showXpub",
        component: WalletSettingsXpub
      },

      // Marketplace
      {
        path: "marketplace",
        component: TabMarketplaceOverview
      },

      // Account
      {
        path: "contacts",
        component: TabContacts,
      },
      {
        path: "profile",
        component: TabProfileOverview,
      },

      // App settings
      {
        path: "settings/version",
        component: AppVersion
      }
    ],
  },
  // Wallet Service
  {
    path: "/wallet/getStarted",
    component: WalletGetStarted,
  },
  {
    path: "/wallet/newSeed",
    component: WalletNewSeed,
  },
  {
    path: "/wallet/recovery",
    component: WalletRecovery
  },
  {
    path: "/wallet/addCoin",
    component: WalletAddCoin,
  }
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
