export const wallet = {
  state: {
    wallet: {},
    mnemonic: ""
  },
  mutations: {
    setWalletMnemonic(state, mnemonic) {
      state.mnemonic = mnemonic;
    },
    setWalletState(state, wallet) {
      state.wallet = wallet;
    }
  },
  getters: {
      getWalletMnemonic: state => state.mnemonic,
  }
};
