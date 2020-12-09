<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
      <ion-title>Wallet</ion-title>
    </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-text class="ion-text-center">
        <p v-if="!wallet">
          It appears that you do not have a wallet. Are you ready to start?
        </p>
        <ion-button v-if="!wallet" expand="block" @click="router.push({ path: '/tabs/wallet/newSeed' })">Create a wallet</ion-button>
      </ion-text>
      <ion-card button="true">
        <ion-card-title>{{ wallet }}</ion-card-title>
      </ion-card>
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
  IonButton,
  IonText,
  IonCard,
  IonCardTitle
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
    IonText,
    IonCard,
    IonCardTitle
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