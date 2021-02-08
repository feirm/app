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

      <!-- Card swipers -->
      <div class="swiper-container">
        <div class="swiper-wrapper">
          <div
            class="swiper-slide"
            v-for="coin in store.getters.walletState.coins"
            :key="coin.ticker"
          >
            <!-- Show existing coins -->
            <ion-card
              button="true"
              @click="detailedWallet(store.getters.walletState.id, coin.ticker)"
              :style="{
                'background-image': cGradient.getGradient(coin.ticker),
              }"
            >
              <ion-card-header class="ion-text-left">
                <ion-text style="color: white">
                  <h5>{{ coin.name }}</h5>
                  <h7 v-show="coin.unconfirmedBalance !== '0'">
                    Unconfirmed:
                    {{ (coin.unconfirmedBalance / 100000000).toFixed(3) }}
                    {{ coin.ticker.toUpperCase() }}
                  </h7>
                  <h1>
                    {{ (coin.balance / 100000000).toFixed(3) }}
                    {{ coin.ticker.toUpperCase() }}
                  </h1>
                </ion-text>
              </ion-card-header>
            </ion-card>
          </div>

          <!-- Always show "add wallet/coin" card -->
          <div class="swiper-slide">
            <!-- TODO: Fix style -->
            <ion-card @click="addCoin" :style="{'background-image': cGradient.getGradient('default')}">
              <ion-card-header class="ion-text-left">
                <ion-text style="color: white">
                  <h3>Add a wallet</h3>
                  <p>It's free and we support multiple assets!</p>
                </ion-text>
                <ion-button @click="addCoin" color="primary">Add now</ion-button>
              </ion-card-header>
            </ion-card>
          </div>
        </div>
      </div>

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
            <ion-tab-button @click="sendModal">
              <ion-icon color="primary" :icon="walletOutline"></ion-icon>
              <ion-label>Send</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col>
            <ion-tab-button @click="receiveModal">
              <ion-icon color="success" :icon="qrCodeOutline"></ion-icon>
              <ion-label>Receive</ion-label>
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
  IonGrid,
  IonRow,
  IonCol,
  alertController,
  modalController,
  loadingController,
} from "@ionic/vue";
import {
  walletOutline,
  addCircleOutline,
  scanOutline,
  qrCodeOutline,
} from "ionicons/icons";

import Swiper from "swiper";
import "swiper/swiper-bundle.css";

import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { DateTime } from "luxon";

import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import cardGradient from "@/class/cardGradient";

import SendCoins from "@/components/Wallet/Send/Send.vue";
import ReceivingAddress from "@/components/Wallet/ReceivingAddress.vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import { DecryptContacts, EncryptedContact } from "@/lib/contacts";

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
    IonGrid,
    IonRow,
    IonCol,
  },
  data() {
    return {
      slideIndex: 0,
      wallet: hdWalletP2pkh,
    };
  },
  mounted() {
    // Initialise the Swiper
    const swiper = new Swiper(".swiper-container", {
      // Options
      observer: true,
      observeParents: true,
      slidesPerView: 1.2,
    });

    // Slide change handler
    const self = this;
    swiper.on("slideChange", function () {
      self.slideIndex = swiper.activeIndex;
    });
  },
  methods: {
    detailedWallet(id: string, coin: string) {
      return this.router.push("/tabs/wallet/" + id + "/" + coin.toLowerCase());
    },
    async addCoin() {
      if (this.store.getters.walletExists) {
        return this.router.push({ path: "/wallet/addCoin" });
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
    // Open modal to send XFE
    async sendModal() {
      // Fetch coin based on slide index
      const coin = this.wallet.getAllCoins()[this.slideIndex];

      const modal = await modalController.create({
        component: SendCoins,
        cssClass: "sendCoinsModal",
        componentProps: {
          coin: coin.name,
          ticker: coin.ticker,
        },
      });

      return modal.present();
    },
    // Receiving address modal for XFE
    async receiveModal() {
      // Fetch coin based on slide index
      const coin = this.wallet.getAllCoins()[this.slideIndex];

      const modal = await modalController.create({
        component: ReceivingAddress,
        cssClass: "receivingAddressModal",
        componentProps: {
          coin: coin.name,
          ticker: coin.ticker,
        },
      });

      return modal.present();
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    // Card gradient class
    const cGradient = new cardGradient();

    // Execute on mount
    onMounted(async () => {
      await loadingController
        .create({
          message: "Loading...",
        })
        .then((a) => {
          // Loading popup
          a.present().then(async () => {
            // P2PKH wallet
            const wallet = hdWalletP2pkh;

            // Iterate over all of the coins
            for (let i = 0; i < wallet.getAllCoins().length; i++) {
              const coin = wallet.getAllCoins()[i];

              // Fetch and set coin balances
              wallet.setBalances(coin.ticker, coin.extendedPublicKey);
            }

            // Fetch all transactions
            try {
              await wallet.getAllTransactions();
            } catch (e) {
              throw new Error(e);
            }

            // Fetch and decrypt contacts
            try {
              await tatsuyaService.fetchContacts().then(async (res) => {
                // Set the encrypted contacts array
                const contacts = res.data as EncryptedContact[];
                if (!contacts) {
                  return;
                }

                // Attempt to decrypt contacts array
                await DecryptContacts(contacts)
                  .then((decryptedContacts) => {
                    store.commit("setContacts", decryptedContacts);
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              });
            } catch (e) {
              throw new Error(e);
            }

            // Dismiss once all done
            a.dismiss();
          })
          .catch(async e => {
            // Dismiss loading popup
              a.dismiss();

              // Error alert
              const error = await alertController.create({
                header: "Error loading data!",
                message: e,
                buttons: ["Close"],
              });

              return error.present();
          })
        });
    });

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
      scanOutline,
      qrCodeOutline,
      cGradient,
    };
  },
});
</script>

<style scoped>
/* Spacing between Ion Tab Button and Label */
ion-tab-button > ion-label {
  padding-top: 7.5px;
}

/* Column styling and classes */
ion-col {
  font-size: 12px;
}

.grey-background {
  background-color: var(--ion-color-light);
}

/* Cards */
ion-card {
  height: 10rem;
  display: flex;
}
</style>