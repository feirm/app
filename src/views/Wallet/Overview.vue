<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left" color="transparent">
        <ion-title color="dark">Wallet</ion-title>
        <ion-buttons slot="secondary">
          <ion-button color="primary" @click="addCoin">
            <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
        <!-- Hint if no wallet is present -->
        <ion-card button @click="addCoin" v-show="!store.getters.walletExists">
          <ion-card-header class="ion-text-left">
            <ion-text style="color: white">
              <h3>Add a wallet</h3>
              <p>It's free and we support multiple assets!</p>
            </ion-text>
            <ion-button @click="addCoin">Add now</ion-button>
          </ion-card-header>
        </ion-card>

        <!-- Showcase coins -->
        <ion-card
          v-for="coin in store.getters.walletState.coins"
          v-bind:key="coin"
          button="true"
          @click="detailedWallet(store.getters.walletState.id, coin.ticker)"
        >
          <ion-card-header class="ion-text-left">
            <ion-text style="color: white">
              <h5>{{ coin.name }}</h5>
              <h1>
                {{ (coin.balance / 100000000).toFixed(3) }}
                {{ coin.ticker.toUpperCase() }}
              </h1>
            </ion-text>
          </ion-card-header>
        </ion-card>

        <!-- Showcase recent transactions -->
        <ion-grid>
          <ion-row>
            <ion-col>
              <h4>Transactions</h4>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-text class="ion-text-center" color="medium">
                <p v-show="!store.getters.walletExists">Your transactions will appear here once you create your wallet.</p>
                <p v-show="store.getters.walletExists">Any transactions you make throughout your wallet will appear here.</p>
              </ion-text>
            </ion-col>
          </ion-row>
        </ion-grid>
    </ion-content>

    <!-- Footer -->
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="light" shape="round">
        <ion-icon slot="start" :icon="scanOutline"></ion-icon>
        Scan
      </ion-button>
    </ion-footer>

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
  IonGrid,
  IonRow,
  IonCol,
  IonFooter
} from "@ionic/vue";
import { walletOutline, addCircleOutline, scanOutline } from "ionicons/icons";
import { Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { preload } from "@/preload";

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
    IonGrid,
    IonRow,
    IonCol,
    IonFooter
  },
  data() {
    return {
      wallet: {} as Wallet,
    };
  },
  methods: {
    detailedWallet(id: string, coin: string) {
      this.router.push("/tabs/wallet/" + id + "/" + coin.toLowerCase());
    },
    addCoin() {
      if (this.store.getters.walletExists) {
        console.log("Wallet does exist, so go to coins page...")
        // this.router.push("/wallet/addCoin");
        return;
      }

      this.router.push({ path: "/wallet/getStarted" });
    }
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    onMounted(async () => {
      await preload();
    })

    return {
      router,
      store,
      walletOutline,
      addCircleOutline,
      scanOutline
    };
  },
});
</script>

<style scoped>
ion-card {
  background-image: url("../../assets/img/covers/feirm.png"), linear-gradient(#242424, #1c1c1c);
  background-repeat: no-repeat;
  background-position: bottom right;
}
</style>