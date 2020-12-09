<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
      <ion-title>Wallet</ion-title>
    </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-img src="/assets/logo.png"></ion-img>
            <h1>Feirm Wallet</h1>
            <p>It appears that you don't have a wallet created. Would you like to get started, or restore from a backup? 💰</p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
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
  IonNote
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";
import { GenerateMnemonic, Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";

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
    IonNote
  },
  data() {
    return {
      wallet: {} as Wallet
    }
  },
  ionViewWillEnter() {
    try {
      const wallet = localStorage.getItem("wallet");
      this.wallet = JSON.parse(wallet!);
    } catch (e) {
      console.log(e);
    }
  },
  setup() {
    const router = useRouter();

    return {
      router,
      walletOutline,
      GenerateMnemonic
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