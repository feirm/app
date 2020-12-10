/* eslint-disable @typescript-eslint/camelcase */
import { createStore } from "vuex";

// Vuex modules
import { auth } from "./modules/auth";
import { wallet } from "./modules/wallet";

export const store = createStore({
  modules: {
    auth,
    wallet
  }
});
