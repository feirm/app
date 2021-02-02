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
        </ion-row>
      </ion-grid>

      <!-- Wallet activities -->
      <ion-grid>
        <!-- 2 of 2 row -->
        <ion-row>
          <ion-col class="ion-activatable ion-text-center">
            <!-- Exchange -->
            <hr>
            <ion-icon color="success" :icon="swapHorizontalOutline" size="large"></ion-icon>
            <p>Exchange</p>
            <ion-ripple-effect></ion-ripple-effect>
          </ion-col>
          <ion-col class="ion-activatable ion-text-center grey-background">
            <!-- Faucet -->
            <hr>
            <ion-icon color="danger" :icon="giftOutline" size="large"></ion-icon>
            <p>Earn some XFE</p>
            <ion-ripple-effect></ion-ripple-effect>
          </ion-col>
        </ion-row>

        <!-- 2 of 2 row -->
        <ion-row>
          <ion-col class="ion-activatable ion-text-center grey-background">
            <!-- Coin Settings -->
            <hr>
            <ion-icon color="primary" :icon="settingsOutline" size="large"></ion-icon>
            <p>Coin settings</p>
            <ion-ripple-effect></ion-ripple-effect>
          </ion-col>
          <ion-col class="ion-activatable ion-text-center">
            <!-- Lottery -->
            <hr>
            <ion-icon color="dark" :icon="diceOutline" size="large"></ion-icon>
            <p>Lottery</p>
            <ion-ripple-effect></ion-ripple-effect>
          </ion-col>
        </ion-row>

        <!-- 2 of 2 row -->
        <ion-row>
          <ion-col class="ion-activatable ion-text-center">
            <!-- Pay a Contact -->
            <hr>
            <ion-icon color="secondary" :icon="personOutline" size="large"></ion-icon>
            <p>Pay a contact</p>
            <ion-ripple-effect></ion-ripple-effect>
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
  IonRippleEffect,
  alertController,
} from "@ionic/vue";
import {
  walletOutline,
  addCircleOutline,
  scanOutline,
  qrCodeOutline,
  swapHorizontalOutline,
  giftOutline,
  settingsOutline,
  diceOutline,
  personOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
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
    IonRippleEffect
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

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
      scanOutline,
      qrCodeOutline,
      swapHorizontalOutline,
      giftOutline,
      settingsOutline,
      diceOutline,
      personOutline
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

/* Column styling and classes */
ion-col {
  font-size: 12px;
}

.grey-background {
  background-color: var(--ion-color-dark);
  color: var(--ion-color-light)
}
</style>