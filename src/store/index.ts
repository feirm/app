import { createStore } from "vuex";

// Vuex modules
import { auth } from "./modules/auth";
import { wallet } from "./modules/wallet";
import { coins } from "./modules/coins";
import { options } from "./modules/options";

export const store = createStore({
  modules: {
    auth,
    wallet,
    coins,
    options
  }
});
