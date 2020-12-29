<template>
  <ion-page>
    <ion-content class="ion-padding" :fullscreen="true"> </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent } from "@ionic/vue";
import { Coin, FindWallet } from "@/lib/wallet";
import axios from "axios";

export default defineComponent({
  name: "Transactions",
  components: {
    IonPage,
    IonContent,
  },
  data() {
    return {
      coin: {} as Coin,
      ticker: "",
    };
  },
  methods: {
    async ionViewWillEnter() {
      // Fetch coin information from localStorage
      const ticker = this.$route.params.coin as string;

      await FindWallet(ticker).then((coin) => {
        this.coin = coin;
        this.ticker = coin.ticker;
      });

      // Fetch transaction history
      const txHistory = await axios.get(
        "https://cors-anywhere.feirm.com/" +
          this.coin.blockbook +
          "/api/v2/xpub/" +
          this.coin.extendedPublicKey +
          "?details=txs"
      );

      // Iterate over each transaction and format them
      for (let i = 0; i < txHistory.data.transactions.length; i++) {
          const tx = txHistory.data.transactions[i];

          // Output the TX
          console.log(tx);
      }
    },
  },
});
</script>