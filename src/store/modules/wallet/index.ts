export const wallet = {
  state: {
    wallet: {},
    mnemonic: ""
  },
  mutations: {
    setWalletState(state, wallet) {
      state.wallet = wallet;
    }
  }
};
