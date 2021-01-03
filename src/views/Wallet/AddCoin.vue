<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Add Coin</ion-title>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- TODO: Add search bar -->

      <!-- List of all coins supported -->
      <ion-list v-if="coins.length !== 0">
        <ion-item
          v-for="coin in coins"
          v-bind:key="coin.name"
          button="true"
          @click="createCoinWallet(store.getters.getWalletMnemonic, coin.name, coin.ticker)"
        >
          <ion-avatar slot="start">
            <img :src="coin.icon" />
          </ion-avatar>
          <ion-label>
            <h2>{{ coin.name }}</h2>
            <p>{{ coin.ticker }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <!-- If there are no coins, show a message -->
      <h2 v-if="coins.length === 0" class="ion-text-center">It appears that you've already added all the coins!</h2>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonBackButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  alertController,
} from "@ionic/vue";
import { informationCircleOutline } from "ionicons/icons";
import azureService from "@/apiService/azureService";
import { Coin, DeriveWallet, Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "AddCoin",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonBackButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
  },
  data() {
    return {
      coins: [] as Coin[],
    };
  },
  async ionViewWillEnter() {
    // Fetch coins list
    await azureService
      .getCoins()
      .then((res) => {
        const cData = res.data as Coin[];

        // Fetch current wallet
        const wallet = this.store.getters.getWallet as Wallet;

        // Iterate over each coin and remove existing coins from response data
        wallet.coins.forEach(coin => {
          for (let i = 0; i < cData.length; i++) {
            const c = cData[i] as Coin;

            if (c.ticker.toLocaleLowerCase() === coin.ticker.toLocaleLowerCase()) {
              // Remove the coin already in use
              cData.splice(i, 1);
            }
          }
        })

        this.coins = cData;
      })
      .catch(async (err) => {
        // TODO: Error alert
        console.log(err);
      });
  },
  methods: {
    async presentAlert() {
      const alert = await alertController.create({
        header: "Information",
        message:
          "Collecting some coins? You can store supported coins within your Feirm wallet! Take a look at the list on this page.",
        buttons: ["Okay"],
      });

      return alert.present();
    },
    async createCoinWallet(mnemonic: string, coin: string, ticker: string) {
      console.log("mnemonic:", mnemonic)
      // Create a confirmation alert asking the user if they want to add a new coin
      const confirmAlert = await alertController.create({
        header: "Add new coin?",
        message: `Do you want to add ${coin} (${ticker}) to your wallet?`,
        buttons: [
          {
            text: "No",
          },
          {
            text: "Yes",
            handler: async () => {
              // Add coin to wallet
              const wallet = await DeriveWallet(mnemonic, ticker);
              this.store.commit("setWalletState", wallet);

              this.router.push({ path: "/tabs/wallet" });
            },
          },
        ],
      });

      return confirmAlert.present();
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      informationCircleOutline,
    };
  },
});
</script>