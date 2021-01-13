import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { store } from "@/store";

export const wallet = {
  state: {
    wallet: {},
    mnemonic: ""
  },
  mutations: {
    setWalletState(state, wallet) {
      state.wallet = wallet;
    }
  },
  actions: {
    async initialize({ commit }) {
      const wallet = await hdWalletP2pkh.loadFromDisk();

      if (wallet) {
        commit("setWalletState", wallet);
      }
    }
  },
  getters: {
    walletState: state => state.wallet,
    walletExists: state => {
      if (state.wallet.coins) {
        return true;
      }

      return false;
    }
  }
};
