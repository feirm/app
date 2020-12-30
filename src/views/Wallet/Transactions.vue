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
            v-if="tx.isOutgoing"
            slot="start"
            size="large"
            color="danger"
            :icon="arrowUpCircleOutline"
          ></ion-icon>
          <ion-icon
            v-if="!tx.isOutgoing"
            slot="start"
            size="large"
            color="success"
            :icon="arrowDownCircleOutline"
          ></ion-icon>
          <ion-text>
            <p>{{ tx.blockTime }}</p>
            <p>
              <b> {{ tx.value }} {{ this.ticker.toUpperCase() }} </b>
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

import { arrowDownCircleOutline, arrowUpCircleOutline } from "ionicons/icons";
import BigNumber from "bignumber.js";

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
          "?details=txs&tokens=used"
      );

      // Representation of a TX
      interface Transaction {
        txid: string;
        blockTime: string;
        value: string;
        isOutgoing: boolean;
      }

      // Iterate over each transaction and format them
      for (let i = 0; i < txHistory.data.transactions.length; i++) {
        const tx = txHistory.data.transactions[i];

        // New transaction instance
        const newTx = {} as Transaction;

        // Set id
        newTx.txid = tx.txid;

        // Formatted time
        newTx.blockTime = DateTime.fromSeconds(parseInt(tx.blockTime)).toFormat(
          "dd/MM/yyyy, hh:mm a"
        );

        // Determine if a transaction is incoming or outgoing
        // by checking if a change address the user owns is present.
        // If a change address the user owns is present, the the TX is outgoing

        // Iterate over the known tokens used for these transactions
        for (let i = 0; i < txHistory.data.tokens.length; i++) {
          const token = txHistory.data.tokens[i];
          
          // Iterate over each output and determine whether or not a change address we own is present
          for (let j = 0; j < tx.vout.length; j++) {
            // Find matching addresses and check if they are part of change we own
            if (tx.vout[j].addresses[0] === token.name && token.path.includes("/0'/1/") === true) {
              // Transaction must be outgoing
              newTx.isOutgoing = true;
            }

            // TODO Find the value of the transaction for the address we don't own
            if (tx.vout[j].addresses[0] !== token.name) {
              newTx.value = new BigNumber(tx.vout[j].value).dividedBy(100000000).toString()
            }
          }
        }

        // Append to array of transactions
        this.txs.push(newTx);
      }
    },
    openTx(hash: string) {
      window.open(this.coin.blockbook + "/tx/" + hash);
    },
  },
  setup() {
    return {
      arrowDownCircleOutline,
      arrowUpCircleOutline,
    };
  },
});
</script>