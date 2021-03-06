import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { Wallet } from "@/models/wallet";
import { Transaction } from "@/models/transaction";

export const wallet = {
  state: {
    wallet: {} as Wallet,
    transactions: [] as Transaction[],
    mnemonic: ""
  },
  mutations: {
    setWalletState(state, wallet) {
      state.wallet = wallet;
    },
    setAllTransactions(state, transactions) {
      state.transactions = transactions;
    },
    clearAllTransactions(state) {
      state.transactions = [];
    },
    clearWallet(state) {
      state.wallet = {};
      state.transactions = [];
      state.mnemonic = "";
    }
  },
  actions: {
    async initialize({ commit }) {
      const wallet = await hdWalletP2pkh.loadFromDisk();

      if (wallet) {
        // Update wallet state
        commit("setWalletState", wallet);
      }
    },
    clearWallet({ commit }) {
      const wallet = hdWalletP2pkh;
      wallet.deleteWallet();

      commit("clearWallet");

      // Remove from localStorage
      localStorage.removeItem("wallet");
    }
  },
  getters: {
    // Wallet getters
    walletState: state => state.wallet,
    walletExists: state => {
      if (state.wallet.coins) {
        return true;
      }

      return false;
    },

    // Transaction getters
    allTransactions: state => state.transactions, // Txs for all coins
    // Get Txs for an individual coin
    getTransactions: state => ticker => {
      const txs: Transaction[] = [];

      state.transactions.forEach(tx => {
        if (tx.ticker.toLowerCase() === ticker.toLowerCase()) {
          txs.push(tx);
        }
      });
      
      return txs;
    }
  }
};
