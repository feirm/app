<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Transaction History</ion-title>
        <ion-buttons slot="secondary">
          <ion-button></ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-item-group>
        <ion-item
          v-for="tx in txs"
          v-bind:key="tx.txid"
          button="true"
          @click="openTx(tx.txid)"
        >
          <ion-icon
            slot="start"
            size="large"
            color="success"
            :icon="arrowDownCircleOutline"
          ></ion-icon>
          <ion-text>
            <p>{{ tx.blockTime }}</p>
            <p>
              <b>
                {{ tx.valueIn / 100000000 }} {{ this.ticker.toUpperCase() }}
              </b>
            </p>
          </ion-text>
        </ion-item>
      </ion-item-group>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonItem,
  IonItemGroup,
  IonText,
  IonIcon,
} from "@ionic/vue";
import { Coin, FindWallet } from "@/lib/wallet";
import axios from "axios";
import { DateTime } from "luxon";

import { arrowDownCircleOutline } from "ionicons/icons";

export default defineComponent({
  name: "Transactions",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonItem,
    IonItemGroup,
    IonText,
    IonIcon,
  },
  data() {
    return {
      coin: {} as Coin,
      txs: [] as any,
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

        tx.blockTime = DateTime.fromSeconds(parseInt(tx.blockTime)).toFormat(
          "dd/MM/yyyy, hh:mm a"
        );

        // Append to array of transactions
        this.txs.push(tx);
      }
    },
    openTx(hash: string) {
      window.open(this.coin.blockbook + "/tx/" + hash);
    },
  },
  setup() {
    return {
      arrowDownCircleOutline,
    };
  },
});
</script>