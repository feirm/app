<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-title color="dark">Wallet</ion-title>
        <ion-buttons slot="secondary">
          <ion-button color="primary" @click="addCoin">
            <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Refresher element -->
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-slides>
        <ion-slide
          v-for="coin in store.getters.walletState.coins"
          v-bind:key="coin"
        >
          <!-- Show existing coins -->
          <ion-card
            button="true"
            @click="detailedWallet(store.getters.walletState.id, coin.ticker)"
          >
            <ion-card-header class="ion-text-left">
              <ion-text style="color: white">
                <h5>{{ coin.name }}</h5>
                <h7 v-show="coin.unconfirmedBalance !== '0'"
                  >Unconfirmed:
                  {{ (coin.unconfirmedBalance / 100000000).toFixed(3) }}
                  {{ coin.ticker.toUpperCase() }}</h7
                >
                <h1>
                  {{ (coin.balance / 100000000).toFixed(3) }}
                  {{ coin.ticker.toUpperCase() }}
                </h1>
              </ion-text>
            </ion-card-header>
          </ion-card>
        </ion-slide>

        <!-- Show add a wallet card if no wallet is present -->
        <ion-slide v-show="!store.getters.walletState.coins">
          <ion-card @click="addCoin">
            <ion-card-header class="ion-text-left">
              <ion-text style="color: white">
                <h3>Add a wallet</h3>
                <p>It's free and we support multiple assets!</p>
              </ion-text>
              <ion-button @click="addCoin">Add now</ion-button>
            </ion-card-header>
          </ion-card>
        </ion-slide>
      </ion-slides>

      <!-- Quick actions menu -->
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-tab-button>
              <ion-icon color="secondary" :icon="scanOutline"></ion-icon>
              <ion-label>Scan to pay</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col>
            <ion-tab-button>
              <ion-icon
                color="primary"
                :icon="walletOutline"
              ></ion-icon>
              <ion-label>Send</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col>
            <ion-tab-button>
              <ion-icon color="danger" :icon="qrCodeOutline"></ion-icon>
              <ion-label>Receive</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col>
            <ion-tab-button>
              <ion-icon color="success" :icon="swapHorizontalOutline"></ion-icon>
              <ion-label>Exchange</ion-label>
            </ion-tab-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonCard,
  IonCardHeader,
  IonText,
  IonIcon,
  IonButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonSlides,
  IonSlide,
  IonGrid,
  IonRow,
  IonCol,
  alertController,
} from "@ionic/vue";
import {
  walletOutline,
  addCircleOutline,
  scanOutline,
  qrCodeOutline,
  swapHorizontalOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { preload } from "@/preload";
import { DateTime } from "luxon";

import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import axios from "axios";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonCard,
    IonCardHeader,
    IonText,
    IonIcon,
    IonButton,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    IonSlides,
    IonSlide,
    IonGrid,
    IonRow,
    IonCol,
  },
  data() {
    return {
      wallet: hdWalletP2pkh,
    };
  },
  methods: {
    detailedWallet(id: string, coin: string) {
      return this.router.push("/tabs/wallet/" + id + "/" + coin.toLowerCase());
    },
    async addCoin() {
      if (this.store.getters.walletExists) {
        // Show an error as there is an issue with new coins right now
        const error = await alertController.create({
          header: "Maintenance mode",
          message: "This functionality is currently disabled. Please try again later.",
          buttons: ["Close"],
        });

        return error.present();

        // return this.router.push({ path: "/wallet/addCoin" });
      }

      this.router.push({ path: "/wallet/getStarted" });
    },
    formatDate(date: string) {
      return DateTime.fromSeconds(parseInt(date)).toRelative();
    },
    openBlockbook(ticker: string, txid: string) {
      const blockbookUrl = hdWalletP2pkh.getBlockbook(ticker);
      window.open(blockbookUrl + "/tx/" + txid);
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    onMounted(async () => {
      await preload();
    });

    // Transaction and balance refresh
    const doRefresh = async (event: any) => {
      // Update balances for all coins
      const allCoins = hdWalletP2pkh.getAllCoins();

      for (let i = 0; i < allCoins.length; i++) {
        // Get the blockbook instance for our coin
        const blockbookUrl = hdWalletP2pkh.getBlockbook(allCoins[i].ticker);

        // Get the balances using the XPUB
        const xpub = hdWalletP2pkh.getXpub(allCoins[i].ticker);
        await axios
          .get(
            `https://cors-anywhere.feirm.com/${blockbookUrl}/api/v2/xpub/${xpub}`
          )
          .then((res) => {
            // Set balances
            hdWalletP2pkh.setBalance(allCoins[i].ticker, res.data.balance); // Confirmed balance
            hdWalletP2pkh.setUnconfirmedBalance(
              allCoins[i].ticker,
              res.data.unconfirmedBalance
            ); // Unconfirmed balance

            // Save balances
            hdWalletP2pkh.saveToDisk();
            hdWalletP2pkh.saveToCache();
          });
      }

      event.target.complete();
    };

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
      scanOutline,
      qrCodeOutline,
      swapHorizontalOutline,
      doRefresh,
    };
  },
});
</script>

<style scoped>
/* Card header */
ion-card {
  background-image: url("../../assets/img/covers/feirm.png"),
    linear-gradient(#242424, #1c1c1c);
  background-repeat: no-repeat;
  background-position: bottom right;
  width: 100%;
}

/* Spacing between Ion Tab Button and Label */
ion-tab-button > ion-label {
  padding-top: 7.5px;
}
</style>