<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
      <ion-title>Wallet</ion-title>
    </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-text class="ion-text-center">
        <p v-if="wallets.length === 0">
          It appears that you do not have a wallet. Are you ready to start?
        </p>
        <ion-button expand="block" @click="router.push({ path: '/tabs/wallet/newSeed' })">Create a wallet</ion-button>
      </ion-text>
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
  IonText
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";
import { GenerateMnemonic } from "@/lib/wallet";
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
    IonText
  },
  data() {
    return {
      wallets: []
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