import { azureApi } from "@/apiService/Api";

export default {
  // Return data for all coins
  getCoins() {
    return azureApi.get(`/v1/coins`);
  },
  getCoin(ticker: string) {
    return azureApi.post(`/v1/coin`, {
      ticker: ticker,
    });
  },
};
