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