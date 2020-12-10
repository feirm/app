/* eslint-disable @typescript-eslint/camelcase */
import { createStore } from "vuex";
import { Wallet } from "@/lib/wallet";
import { auth } from "./modules/auth";

export const store = createStore({
  modules: {
    auth,
  },
  state: {
    wallet: {} as Wallet,
  },
  mutations: {
    // Mutations for wallet
    setMnemonic(state, mnemonic) {
      state.wallet.mnemonic = mnemonic;
    },
    setWalletState(state, wallet) {
      state.wallet = wallet;
    },
  },
  actions: {
    initialize({ commit }) {
      const wallet = localStorage.getItem("wallet");

      if (wallet) {
        commit("setWalletState", JSON.parse(wallet));
      }
    },
  },
  getters: {
    // Wallet
    getWalletMnemonic: (state) => state.wallet.mnemonic,
    getWallet: (state) => state.wallet,
  },
});
