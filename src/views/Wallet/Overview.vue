<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Present the wallet/coins in a nice format -->
      <div>
        <ion-card color="light">
          <ion-card-content>
            <ion-col>
              <ion-row>
                <p>Balance</p>
              </ion-row>
              <ion-row>
                <h1>${{ fiatBalance.toFixed(2) }}</h1>
              </ion-row>
            </ion-col>
          </ion-card-content>
        </ion-card>

        <h6 class="ion-text-center">Your Coins</h6>

        <!-- Showcase coins -->
        <ion-card
          v-for="coin in store.getters.getWallet.coins"
          v-bind:key="coin"
          color="light"
          button="true"
          @click="detailedWallet(store.getters.getWalletId, coin.ticker)"
        >
          <ion-card-content>
            <ion-item lines="none" color="light">
              <ion-avatar>
                <img :src="coin.icon" />
              </ion-avatar>
              <ion-grid>
                <ion-row>
                  <ion-col>
                    <p class="ion-text-right">
                      {{ coin.name }} ({{ coin.ticker.toUpperCase() }})
                    </p>
                  </ion-col>
                  <ion-col>
                    <ion-text color="primary">
                      <p class="ion-text-center">
                        {{ (coin.balance / 100000000).toFixed(2) }}
                        {{ coin.ticker.toUpperCase() }}
                      </p>
                    </ion-text>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-item>
          </ion-card-content>
        </ion-card>
        <ion-button fill="clear" expand="block" @click="addCoin">
          <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonText,
  IonIcon,
  IonButton,
  loadingController,
  alertController,
} from "@ionic/vue";
import { walletOutline, addCircleOutline } from "ionicons/icons";
import { Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonItem,
    IonAvatar,
    IonText,
    IonIcon,
    IonButton,
  },
  data() {
    return {
      balance: 0,
      fiatBalance: 0 as any,
      wallet: {} as Wallet,
    };
  },
  async ionViewWillEnter() {
    const walletPresent = this.store.getters.isWalletPresent;
    if (!walletPresent) {
      // Assume the user has removed the wallet somehow, or they are a new user
      this.router.push({
        path: "/wallet/getStarted",
      });

      return;
    }

    // Loading controller
    await loadingController
      .create({
        message: "Loading balances...",
      })
      .then((a) => {
        a.present().then(async () => {
          // Fetch latest wallet balances from Blockbook
          const coins = this.store.getters.getCoins;

          // Reset cumulative fiat balance
          let fiatBal = 0;

          // Iterate over each coin
          coins.forEach(async (coin) => {
            await axios
              .get(`https://cors-anywhere.feirm.com/${coin.blockbook}/api/v2/xpub/${coin.extendedPublicKey}`)
              .then((res) => {
                coin.balance = res.data.balance ? res.data.balance : 0;
              });

            // Fetch cumulative fiat balance for USD
            // Hardcoded to Feirm for now
            await axios
              .get(
                `https://api.coingecko.com/api/v3/simple/price?ids=feirm&vs_currencies=usd`
              )
              .then((res) => {
                // Need to make this dynamic
                fiatBal += res.data.feirm.usd * (coin.balance / 100000000);
                
                this.fiatBalance = fiatBal;
              });
          });

          a.dismiss();
        })
        .catch(async (err) => {
          a.dismiss();

          const error = await alertController.create({
            header: "Error fetching balances!",
            message: err,
            buttons: ["Okay!"]
          })

          return error.present();
        });
      });
  },
  methods: {
    detailedWallet(id: string, coin: string) {
      this.router.push("/tabs/wallet/" + id + "/" + coin);
    },
    addCoin() {
      this.router.push("/wallet/addCoin");
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
    };
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 100px;
}

ion-grid {
  height: 100%;
}

ion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>