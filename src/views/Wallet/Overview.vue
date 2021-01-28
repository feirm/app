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
          <ion-slide v-for="coin in store.getters.walletState.coins" v-bind:key="coin">
            <!-- Show existing coins -->
            <ion-card @click="detailedWallet(store.getters.walletState.id, coin.ticker)">
              <ion-card-header class="ion-text-left">
                <ion-text style="color: white">
                  <h5>{{ coin.name }}</h5>
                  <h7 v-show="coin.unconfirmedBalance !== '0'">Unconfirmed: {{ (coin.unconfirmedBalance / 100000000).toFixed(3) }} {{ coin.ticker.toUpperCase() }}</h7>
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

        <!-- Showcase recent transactions -->
        <ion-grid>
          <ion-row>
            <ion-col>
              <h4>Recent Transactions</h4>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-text class="ion-text-center" color="medium">
                <p v-show="!store.getters.walletExists">Your transactions will appear here once you create your wallet.</p>
                <p v-show="store.getters.walletExists && store.getters.allTransactions.length === 0">Any transactions you make throughout your wallet will appear here.</p>
              </ion-text>

              <!-- Transactions -->
              <ion-item-group>
                <ion-item button="true" lines="none" class="ion-no-padding" color="transparent" v-for="tx in store.getters.allTransactions" v-bind:key="tx.txid" @click="openBlockbook(tx.ticker, tx.txid)">
                  <!-- Icons: incoming, outgoing or pending -->
                  <ion-icon v-if="tx.confirmations > 0" slot="start" :color="!tx.isMine ? 'danger' : 'success'" :icon="!tx.isMine ? arrowUpCircleOutline : arrowDownCircleOutline"></ion-icon>
                  <ion-icon v-if="tx.confirmations === 0" slot="start" color="warning" :icon="timeOutline"></ion-icon>

                  <!-- Time received -->
                  <ion-label>{{ formatDate(tx.blockTime) }}</ion-label>

                  <!-- Value -->
                  <ion-label slot="end" class="ion-text-right">{{ tx.value }} <b>{{ tx.ticker.toUpperCase() }}</b></ion-label>
                </ion-item>
              </ion-item-group>
            </ion-col>
          </ion-row>
        </ion-grid>
    </ion-content>

    <!-- Footer -->
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="light" shape="round">
        <ion-icon slot="start" :icon="scanOutline"></ion-icon>
        Scan
      </ion-button>
    </ion-footer>

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
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonItemGroup,
  IonItem,
  IonSlides,
  IonSlide,
  alertController,
} from "@ionic/vue";
import { walletOutline,addCircleOutline, scanOutline, arrowUpCircleOutline, arrowDownCircleOutline, timeOutline } from "ionicons/icons";
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
    IonGrid,
    IonRow,
    IonCol,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    IonItemGroup,
    IonItem,
    IonSlides,
    IonSlide
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
          header: "Error!",
          message: "This functionality is currently unavailable!",
          buttons: ["Close"]
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
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    onMounted(async () => {
      await preload();
    })

    // Transaction and balance refresh
    const doRefresh = async (event: any) => {
      console.log("Attempting to refresh balances and transactions...")

      // Subsequently, get all transactions
      await hdWalletP2pkh.getAllTransactions().then(() => {
        event.target.complete();
      })

      // Update balances for all coins
      const allCoins = hdWalletP2pkh.getAllCoins();

      for (let i = 0; i < allCoins.length; i++) {
        // Get the blockbook instance for our coin
        const blockbookUrl = hdWalletP2pkh.getBlockbook(allCoins[i].ticker);
              
        // Get the balances using the XPUB
        const xpub = hdWalletP2pkh.getXpub(allCoins[i].ticker);
        await axios.get(`https://cors-anywhere.feirm.com/${blockbookUrl}/api/v2/xpub/${xpub}`).then(res => {
          // Set balances
          hdWalletP2pkh.setBalance(allCoins[i].ticker, res.data.balance); // Confirmed balance
          hdWalletP2pkh.setUnconfirmedBalance(allCoins[i].ticker, res.data.unconfirmedBalance) // Unconfirmed balance

          // Save balances
          hdWalletP2pkh.saveToDisk();
          hdWalletP2pkh.saveToCache();
        });
      }
    }

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
      scanOutline,
      arrowUpCircleOutline,
      arrowDownCircleOutline,
      timeOutline,
      doRefresh,
    };
  },
});
</script>

<style scoped>
/* Card header */
ion-card {
  background-image: url("../../assets/img/covers/feirm.png"), linear-gradient(#242424, #1c1c1c);
  background-repeat: no-repeat;
  background-position: bottom right;
  width: 100%;
}
</style>