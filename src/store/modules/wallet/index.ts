export const wallet = {
  state: {
    wallet: {
      id: "",
      mnemonic: "",
      // We can have multiple coins in a wallet
      coins: [
        {
          name: "",
          rootKey: "",
          extendedPrivateKey: "",
          extendedPublicKey: "",
          index: 0,
          blockbook: "",

          // Network information
          network: {
            bip44: 0,
            txVersion: 0,
            messagePrefix: "",
            bech32: "",
            bip32: {
              private: 0,
              public: 0,
            },
            pubKeyHash: 0,
            scriptHash: 0,
            wif: 0,
          },
        },
      ],
    },
  },
  mutations: {
    setWalletMnemonic(state, mnemonic) {
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
      getWalletMnemonic: state => state.wallet.mnemonic,
      getWallet: state => state.wallet,
      getCoins: state => state.wallet.coins,
      isWalletPresent: state => {
        if (state.wallet.id == "") {
          return false
        }

        return true
      }
  }
};
