<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-grid>
          <ion-row class="ion-no-padding">
            <ion-col>
              <ion-buttons class="ion-float-left">
                <ion-back-button style="color: white"></ion-back-button>
              </ion-buttons>

              <ion-buttons class="ion-float-right">
                <ion-button @click="coinSettings" style="color: white">
                  <ion-icon :icon="ellipsisHorizontal" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-col>
          </ion-row>

          <!-- Balance -->
          <ion-row class="ion-padding">
            <ion-col>
              <ion-text style="color: white">
                <h4><b>{{ coin.name }}</b></h4>
                <h1>{{ (coin.balance / 100000000).toFixed(3) }} {{ ticker.toUpperCase() }}</h1>
              </ion-text>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Refresher element -->
      <ion-refresher slot="fixed" @ionRefresh="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid>
        <!-- Recent transactions -->
        <ion-row>
          <ion-col>
            <h4 class="ion-text-bold">
              Transactions
            </h4>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <p v-show="store.getters.getTransactions(ticker).length === 0">It appears that you do not have any transactions yet...</p>

            <!-- Transactions -->
            <ion-item-group>
              <ion-item lines="none" class="ion-no-padding" color="transparent" v-for="tx in store.getters.getTransactions(ticker)" v-bind:key="tx.txid" @click="openBlockbook(ticker, tx.txid)">
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

    <!-- Send and receive buttons -->
    <ion-footer class="ion-no-border ion-padding">
      <ion-grid>
        <ion-row class="ion-no-padding">
          <ion-col>
            <ion-button expand="block" @click="receiveModal">
              <ion-icon slot="start" :icon="chevronDownCircleOutline"></ion-icon>
              Receive
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" @click="sendModal">
              <ion-icon slot="start" :icon="chevronUpCircleOutline"></ion-icon>
              Send
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonText,
  IonRefresher,
  IonRefresherContent,
  modalController
} from "@ionic/vue";
import {
  chevronUpCircleOutline,
  chevronDownCircleOutline,
  ellipsisHorizontal,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  timeOutline
} from "ionicons/icons";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";
import axios from "axios";

// Components
import ReceivingAddress from "@/components/Wallet/ReceivingAddress.vue";
import SendCoins from "@/components/Wallet/Send/Send.vue";

// Wallet
import { Coin } from "@/models/coin";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";

export default defineComponent({
  name: "Details",
  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonFooter,
    IonText,
    IonRefresher,
    IonRefresherContent,
  },
  data() {
    return {
      coin: {} as Coin,
      ticker: "",
    };
  },
  async ionViewWillEnter() {
    // Extract the coin ticker
    const ticker = this.$route.params.coin as string;

    // Fetch the coin data
    const coin = hdWalletP2pkh.getCoin(ticker);

    // Set the coin data for this view
    this.coin = coin;
    this.ticker = coin.ticker;
  },
  methods: {
    coinSettings() {
      const id = this.$route.params.id as string;
      this.router.push({ path: "/tabs/wallet/" + id + "/" + this.ticker.toLowerCase() + "/settings"})
    },
    async receiveModal() {
      const modal = await modalController.create({
        component: ReceivingAddress,
        cssClass: "receivingAddressModal",
        componentProps: {
          coin: this.coin.name,
          ticker: this.coin.ticker,
        },
      });

      return modal.present();
    },
    async sendModal() {
      const modal = await modalController.create({
        component: SendCoins,
        cssClass: "sendCoinsModal",
        componentProps: {
          coin: this.coin.name,
          ticker: this.coin.ticker,
        },
      });

      return modal.present();
    },
    formatDate(date: string) {
      const time = DateTime.fromSeconds(parseInt(date)).toRelative();
      return time;
    },
    openBlockbook(ticker: string, txid: string) {
      const blockbookUrl = hdWalletP2pkh.getBlockbook(ticker);
      window.open(blockbookUrl + "/tx/" + txid); 
    }
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    // Transaction and balance refresh
    // TODO: ^^^ Refactor into its own global method
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
      store,
      router,
      chevronUpCircleOutline,
      chevronDownCircleOutline,
      ellipsisHorizontal,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
      timeOutline,
      doRefresh
    };
  },
});
</script>

<style scoped>
ion-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.address {
  font-size: 11px;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

ion-toolbar {
  --background: url("../../assets/img/covers/feirm.png") no-repeat bottom right, linear-gradient(#242424, #1c1c1c);
}
</style>