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
      <ion-grid>
        <ion-button v-show="ticker.toLowerCase() === 'xfe'" expand="block" color="primary" href="https://trade.birake.com">Buy Feirm</ion-button>

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
            <p>It appears that you do not have any transactions yet...</p>
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
  modalController,
  alertController,
} from "@ionic/vue";
import {
  chevronUpCircleOutline,
  chevronDownCircleOutline,
  ellipsisHorizontal
} from "ionicons/icons";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";

// Components
import ReceivingAddress from "@/components/Wallet/ReceivingAddress.vue";
import SendCoins from "@/components/Wallet/SendCoins.vue";
import BigNumber from "bignumber.js";
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
    IonText
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
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
      chevronUpCircleOutline,
      chevronDownCircleOutline,
      ellipsisHorizontal
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