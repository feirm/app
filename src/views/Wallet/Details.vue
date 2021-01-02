<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ coin.name }} ({{ ticker.toUpperCase() }})</ion-title>
        <ion-buttons slot="secondary">
          <ion-button @click="removeCoin" color="danger">
            <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-card color="light">
        <ion-card-content>
          <h1>
            {{ (coin.balance / 100000000).toFixed(2) }}
            {{ ticker.toUpperCase() }}
          </h1>
        </ion-card-content>
      </ion-card>
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-button color="light" @click="sendModal">
            <ion-icon
              color="primary"
              slot="icon-only"
              :icon="arrowUpOutline"
            ></ion-icon>
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="light" @click="receiveModal">
            <ion-icon
              color="primary"
              slot="icon-only"
              :icon="arrowDownOutline"
            ></ion-icon>
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="light" @click="transactionHistory">
            <ion-icon
              color="primary"
              slot="icon-only"
              :icon="receiptOutline"
            ></ion-icon>
          </ion-button>
        </ion-col>
        <ion-col>
          <ion-button color="light">
            <ion-icon
              color="primary"
              slot="icon-only"
              :icon="settingsOutline"
            ></ion-icon>
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonCard,
  IonCardContent,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
  IonTitle,
  IonBackButton,
  modalController,
  alertController,
} from "@ionic/vue";
import {
  arrowUpOutline,
  arrowDownOutline,
  receiptOutline,
  trashOutline,
  settingsOutline,
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
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonTitle,
    IonBackButton,
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
              // Fetch entire wallet from LocalStorage and parse it
              const localWallet = localStorage.getItem("wallet") as string;
              const wallet = JSON.parse(localWallet) as Wallet;

              // Fetch the index of the coin based on its ticker
              const index = wallet.coins
                .map((coin) => coin.ticker)
                .indexOf(this.coin.ticker);

              // Remove the coin from wallet
              wallet.coins.splice(index, 1);

              // Update the wallet state
              this.store.commit("setWalletState", wallet);

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
      arrowUpOutline,
      arrowDownOutline,
      receiptOutline,
      trashOutline,
      settingsOutline,
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
</style>