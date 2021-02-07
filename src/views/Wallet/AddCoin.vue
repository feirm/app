<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-title color="dark">Add Coin</ion-title>
        <ion-buttons slot="end">
          <ion-back-button :icon="closeOutline"></ion-back-button>
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
          @click="createCoinWallet(coin.ticker)"
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
      <h2 v-if="coins.length === 0" class="ion-text-center">
        It appears that you've already added all the coins!
      </h2>
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
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  loadingController,
  alertController,
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import azureService from "@/apiService/azureService";
import { Coin } from "@/models/coin";

export default defineComponent({
  name: "AddCoin",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonBackButton,
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
    // Wrap everything in a loading popup
    await loadingController
      .create({
        message: "Fetching coins data...",
      })
      .then((a) => {
        a.present()
          .then(async () => {
            const coins = await azureService.getCoins();

            // Need to iterate over each of the coin data
            for (let i = 0; i < coins.data.length; i++) {
              // Current coin details
              const coin = coins.data[i];

              // Modify the network information
              // P2PKH
              if (coin.networks.p2pkh) {
                coin.networks.p2pkh.pubKeyHash =
                  coin.networks.p2pkh.pubKeyHash[0];
                coin.networks.p2pkh.scriptHash =
                  coin.networks.p2pkh.scriptHash[0];
                coin.networks.p2pkh.wif = coin.networks.p2pkh.wif[0];

                // Update the original data
                coins.data[i].networks.p2pkh = coin.networks.p2pkh;
              }

              // P2WPKH
              if (coin.networks.P2WPKH) {
                coin.networks.P2WPKH.pubKeyHash =
                  coin.networks.P2WPKH.pubKeyHash[0];
                coin.networks.P2WPKH.scriptHash =
                  coin.networks.P2WPKH.scriptHash[0];
                coin.networks.P2WPKH.wif = coin.networks.P2WPKH.wif[0];

                // Update the original data
                coins.data[i].networks.P2WPKH = coin.networks.P2WPKH;
              }
            }

            // Filter out the coins we already have in our wallet
            const currentCoins = hdWalletP2pkh.getAllCoins();
            currentCoins.forEach(coin => {
              // Iterate over the coin data just fetched
              for (let i = 0; i < coins.data.length; i++) {
                // Remove coin from data if its present in our wallet
                if (coins.data[i].ticker.toLowerCase() === coin.ticker.toLowerCase()) {
                  coins.data.splice(i, 1);
                }
              }
            })

            // Update the coins that the user can add to their wallet
            this.coins = coins.data;

            // Dimiss the loading popup
            a.dismiss();
          })
          .catch(async (e) => {
            // Dismiss and show error
            a.dismiss();

            const error = await alertController.create({
              header: "Error fetching coins data!",
              message: e,
              buttons: ["Close"],
            });

            return error.present();
          });
      });
  },
  methods: {
    async createCoinWallet(ticker: string) {
      // Use P2PKH wallet by default (as base)
      const wallet = hdWalletP2pkh;

      // Wrap inside loading popup
      await loadingController
        .create({
          message: "Creating wallet...",
        })
        .then((a) => {
          a.present()
            .then(async () => {
              // Create new wallet for ticker
              wallet.addCoin(ticker);

              // Establish websocket for new coin
              wallet.establishWss(ticker);

              // Fetch and set balances
              wallet.setBalances(ticker, wallet.getXpub(ticker));

              // Update all transactions
              await wallet.getAllTransactions();

              // Dismiss loading popup and navigate back to index
              a.dismiss();
              this.router.push({ path: "/" });
            })
            .catch(async (e) => {
              // Dismiss and show error
              a.dismiss();

              const error = await alertController.create({
                header: "Error creating coin wallet!",
                message: e,
                buttons: ["Close"],
              });

              return error.present();
            });
        });
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      closeOutline,
    };
  },
});
</script>