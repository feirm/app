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
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import hdWalletP2wpkh from "@/class/wallets/hd-wallet-p2wpkh";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";

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
      coins: [],
    };
  },
  ionViewWillEnter() {
    // Get available coins list and current wallet
    const availableCoins = this.store.getters.getAllCoins;

    // Iterate over each coin we have in our wallet, and remove any duplicates from the available coins list
    availableCoins.forEach(coin => {
      for (let i = 0; i < availableCoins.length; i++) {
        const availableCoin = availableCoins[i];

        if (availableCoin.ticker.toLowerCase() === coin.ticker.toLowerCase()) {
          // Remove the coin already in use
          availableCoins.splice(i, 1);
        }
      }
    })

    // Update the coins list
    this.coins = availableCoins;
  },
  methods: {
    async createCoinWallet(ticker: string) {
      // Fetch the coin data
      const coinData = hdWalletP2pkh.getCoinData(ticker);

      // Check if Segwit is available
      // TODO Change p2pkh wallet to p2wpkh class if Segwit
      if (coinData.segwit) {
        // Check if native segwit is available
        if (coinData.networks.P2WPKH) {
          const wallet = hdWalletP2wpkh;

          // Add coin
          wallet.addCoin(coinData.ticker);

          // Save wallet to disk + cache
          wallet.saveToDisk()
          wallet.saveToCache()

          // Route to index
          this.router.push({ path: "/" }) 
        }
      }

      // TODO Standard P2PKH
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