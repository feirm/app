<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
      <ion-title>Wallet</ion-title>
    </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Show if wallet is not present -->
      <ion-grid v-if="!wallet">
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-img src="/assets/logo.png"></ion-img>
            <h1>Feirm Wallet</h1>
            <p>It appears that you don't have a wallet created. Would you like to get started, or restore from a backup? 💰</p>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Present the wallet/coins in a nice format -->
      <div v-if="wallet">
        <ion-card>
          <ion-card-content>
            <ion-col>
              <ion-row>
                <h2>{{ balance }} XFE</h2>
              </ion-row>
              <ion-row>
                <p>$0.00</p>
              </ion-row>
            </ion-col>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ wallet }}</ion-card-title>
          </ion-card-header>
        </ion-card>
      </div>

    </ion-content>
    <!-- Show footer if wallet is not present -->
    <ion-footer v-if="!wallet" class="ion-no-border ion-padding ion-text-center">
        <ion-button expand="block" @click="router.push({ path: '/tabs/wallet/newSeed' })">Get Started</ion-button>
        <ion-note color="dark">Restore from backup</ion-note>
    </ion-footer>
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
  IonButton,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";
import { GenerateMnemonic, Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import blockBookService from "@/apiService/blockBookService";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonButton,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  },
  data() {
    return {
      balance: 0,
      wallet: {} as Wallet
    }
  },
  async ionViewWillEnter() {
    try {
      const wallet = localStorage.getItem("wallet");
      this.wallet = JSON.parse(wallet!);

      // Fetch account balance
      await blockBookService.getXpub(this.wallet.coin.extendedPublicKey).then(res => {
        this.balance = Number(res.data.balance);
      })
    } catch (e) {
      console.log(e);
    }
  },
  setup() {
    const router = useRouter();

    return {
      router,
      walletOutline,
      GenerateMnemonic,
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