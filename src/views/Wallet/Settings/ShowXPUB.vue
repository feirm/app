<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-left" color="transparent">
      <ion-title color="dark">Show XPUB</ion-title>
      <ion-buttons slot="secondary">
        <ion-back-button :icon="close"></ion-back-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center">
    <ion-grid>
      <ion-row>
        <ion-col>
          <!-- QR Code -->
          <ion-card>
            <ion-card-content>
              <!-- <ion-img :src="qrCode"></ion-img> -->
            </ion-card-content>
          </ion-card>

          <br />

          <!-- XPUB copy to clipboard functionality -->
          <ion-text @click="copyToClipboard">
            <code>
              <p class="xpub">
                <b>{{ wallet.getCoin("xfe").extendedPublicKey }}</b>
              </p>
            </code>
          </ion-text>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script lang="ts">
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { defineComponent } from "vue";

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText,
} from "@ionic/vue";

export default defineComponent({
  name: "ShowXPUB",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonText,
  },
  data() {
    return {
      qrCode: "",
    };
  },
  setup() {
    const wallet = hdWalletP2pkh;

    return {
      wallet,
    };
  },
});
</script>