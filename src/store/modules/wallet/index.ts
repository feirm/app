import { Wallet } from '@/lib/wallet';

export const wallet = {
  state: {
    wallet: {} as Wallet,
    isDecrypted: false,
    pin: "",
    mnemonic: ""
  },
  mutations: {
    setWalletMnemonic(state, mnemonic) {
      state.mnemonic = mnemonic;
    },
    setWalletPin(state, pin) {
      state.pin = pin;
    },
    setWalletState(state, wallet) {
      localStorage.setItem("wallet", JSON.stringify(wallet));
      state.wallet = wallet;
    },
    setWalletUnlockedState(state, wallet) {
      state.isDecrypted = true;
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
    deleteWallet({ commit }) {
      commit("deleteWalletState")
    }
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
      },
      isWalletEncrypted: state => {
        if (state.wallet.encryption) {
          return state.wallet.encryption.isEncrypted;
        } else {
          return false;
        }
      },
      isWalletDecrypted: state => state.isDecrypted,
      getWalletPin: state => state.pin
  }
};
