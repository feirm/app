import { Wallet } from '@/lib/wallet';

export const wallet = {
  state: {
    wallet: {} as Wallet
  },
  mutations: {
    setWalletMnemonic(state, mnemonic) {
      state.wallet.mnemonic = mnemonic;
    },
    setWalletState(state, wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
      state.wallet = wallet;
    },
    deleteWalletState(state) {
      localStorage.removeItem("wallet");
      state.wallet = {};
    }
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
      getWalletMnemonic: state => state.wallet.mnemonic,
      getWallet: state => state.wallet,
      getWalletId: state => state.wallet.id,
      getCoins: state => state.wallet.coins,
      isWalletPresent: state => {
        if (Object.keys(state.wallet).length === 0) {
          return false;
        }

        return true;
      }
  }
};
