<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
      <ion-title>Wallets</ion-title>
    </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-button @click="newWallet">Generate wallets</ion-button>
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
  IonButton
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonButton
  },
  methods: {
    newWallet() {
      console.log("hello")
    }
  },
  setup() {
    return {
      walletOutline,
    };
  },
});
</script>