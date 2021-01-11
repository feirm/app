<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left header-gradient">
        <ion-grid>
          <ion-row class="ion-no-padding">
            <ion-col>
              <ion-buttons class="ion-float-left">
                <ion-back-button color="dark"></ion-back-button>
              </ion-buttons>

              <ion-buttons class="ion-float-right">
                <ion-button @click="removeCoin" color="danger">
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-col>
          </ion-row>

          <!-- Balance -->
          <ion-row class="ion-padding">
            <ion-col>
              <h4><b>{{ coin.name }}</b></h4>
              <h1>{{ (coin.balance / 100000000).toFixed(3) }} {{ ticker.toUpperCase() }}</h1>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-button v-show="coin.ticker === 'xfe'" expand="block" color="primary" href="https://trade.birake.com">Buy Feirm</ion-button>

        <!-- Recent transactions -->
        <ion-row>
          <ion-col>
            <h4 class="ion-text-bold">
              <b>Transactions</b>
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
  modalController,
  alertController,
} from "@ionic/vue";
import {
  chevronUpCircleOutline,
  chevronDownCircleOutline,
  trashOutline
} from "ionicons/icons";
import { useStore } from "vuex";
import { Coin, FindWallet, Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import axios from "axios";

// Components
import ReceivingAddress from "@/components/Wallet/ReceivingAddress.vue";
import SendCoins from "@/components/Wallet/SendCoins.vue";
import BigNumber from "bignumber.js";

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
    IonFooter
  },
  data() {
    return {
      coin: {} as Coin,
      ticker: "",
    };
  },
  async ionViewWillEnter() {
    // Fetch coin information from blockbook
    const ticker = this.$route.params.coin as string;

    await FindWallet(ticker).then((coin) => {
      this.coin = coin;
      this.ticker = coin.ticker;
    });

    // Temporary, update balance (hardcoded for Feirm)
    await axios
    .get(`https://cors-anywhere.feirm.com/${this.coin.blockbook}/api/v2/xpub/${this.coin.extendedPublicKey}`)
    .then((res) => {
      const balance = new BigNumber(res.data.balance).plus(res.data.unconfirmedBalance).toNumber(); 
      this.coin.balance = res.data.balance ? balance : 0;
    });

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
    async removeCoin() {
      // Remove individual coin function
      const alert = await alertController.create({
        header: `Remove ${this.coin.name} wallet?`,
        message: `Don't worry, your ${this.coin.ticker.toUpperCase()}  won't be lost. They are just hidden from you. The ${
          this.coin.name
        } wallet can be added back at any time!`,
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Confirm",
            handler: () => {
              // Fetch entire encrypted wallet from localStorage
              const encryptedWallet = JSON.parse(localStorage.getItem("wallet")!) as Wallet;
              const decryptedWallet = this.store.getters.getWallet;

              // Fetch the index of the coin based on its ticker in the decrypted wallet
              const index = decryptedWallet.coins.map((coin) => coin.ticker).indexOf(this.coin.ticker);

              // Remove the coin from decrypted wallet in Vuex
              decryptedWallet.coins.splice(index, 1);
              this.store.commit("setWalletState", decryptedWallet);

              // Do the same, but on the encrypted one for localStorage
              // Fetch the index of the coin based on its ticker in the encrypted
              const eIndex = encryptedWallet.coins.map((coin) => coin.ticker).indexOf(this.coin.ticker);

              // Remove the coin from encrypted wallet found in localStorage
              encryptedWallet.coins.splice(eIndex, 1);
              localStorage.setItem("wallet", JSON.stringify(encryptedWallet));

              // Push to overall view page
              this.router.push("/tabs/wallet");
            },
          },
        ],
      });

      return alert.present();
    },
    transactionHistory() {
      this.router.push({
        path: `/tabs/wallet/${this.store.getters.getWalletId}/${this.ticker}/transactions`,
      });
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
      trashOutline
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

/* Header gradient */
.header-gradient {
  --background: rgb(22,22,22);
  --background: linear-gradient(90deg, rgba(27,27,27,1) 0%, rgba(50,50,50,1) 100%); 
}
</style>