import azureService from "@/apiService/azureService";
import { Coin } from "@/lib/wallet";

export const coins = {
  state: {
    coins: [] as Coin[]
  },
  mutations: {
    setCoins(state, coins) {
      state.coins = coins;
    }
  },
  actions: {
      // Fetch all coins data
      async setCoins(context) {
          const coins = await azureService.getCoins()

          // Need to iterate over each of the coin data
          for (let i = 0; i < coins.data.length; i++) {
            // Current coin details
            const coin = coins.data[i];

            // Modify the network information
            // P2PKH
            if (coin.networks.p2pkh) {
              coin.networks.p2pkh.pubKeyHash = coin.networks.p2pkh.pubKeyHash[0];
              coin.networks.p2pkh.scriptHash = coin.networks.p2pkh.scriptHash[0];
              coin.networks.p2pkh.wif = coin.networks.p2pkh.wif[0];

              // Update the original data
              coins.data[i].networks.p2pkh = coin.networks.p2pkh;
            }
          }

          context.commit('setCoins', coins.data);
      }
  },
  getters: {
      getAllCoins: state => state.coins,
      getCoin: (state) => (ticker) => {
          return state.coins.find(coin => coin.ticker.toLowerCase() === ticker.toLowerCase());
      }
  }
};