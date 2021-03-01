import { createStore } from "vuex";

// Vuex modules
import { auth } from "./modules/auth";
import { wallet } from "./modules/wallet";
import { coins } from "./modules/coins";

export const store = createStore({
  modules: {
    auth,
    wallet,
    coins
  }
});
