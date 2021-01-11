import { Wallet } from '@/lib/wallet';

export const wallet = {
  state: {
    wallet: {} as Wallet,
    isUnlocked: false,
    pin: "",
    mnemonic: ""
  },
  mutations: {
    setWalletMnemonic(state, mnemonic) {
      state.mnemonic = mnemonic;
    },
    setWalletUnlock(state, unlocked) {
      state.isUnlocked = unlocked;
    },
    setWalletPin(state, pin) {
      state.pin = pin;
    },
    setWalletState(state, wallet) {
      state.wallet = wallet;
    },
    setWalletBalance(state, { ticker, balance }) {
      const index = state.wallet.coins.map(coin => coin.ticker.toLowerCase()).indexOf(ticker.toLowerCase())
      state.wallet.coins[index].balance = balance;
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
      getWalletMnemonic: state => state.mnemonic,
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
      isWalletUnlocked: state => state.isUnlocked,
      getWalletPin: state => state.pin
  }
};
