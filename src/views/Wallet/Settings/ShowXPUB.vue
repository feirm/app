<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
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
                <ion-img :src="qrCode"></ion-img>
              </ion-card-content>
            </ion-card>

            <br />

            <!-- XPUB copy to clipboard functionality -->
            <ion-text @click="copyToClipboard">
              <code>
                <p>{{ xpub }}</p>
              </code>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { defineComponent } from "vue";
import QRCode from "qrcode";

import { close } from "ionicons/icons";

import {
  IonPage,
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
  IonImg,
  toastController,
  alertController,
} from "@ionic/vue";

export default defineComponent({
  name: "ShowXPUB",
  components: {
    IonPage,
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
    IonImg,
  },
  data() {
    return {
      qrCode: "",
      xpub: "",
      ticker: "",
    };
  },
  methods: {
    // Copy XPUB to clipboard
    async copyToClipboard() {
      await navigator.clipboard
        .writeText(this.xpub)
        .then(async () => {
          const toast = await toastController.create({
            message: "XPUB was copied to your clipboard! ✅",
            duration: 2000,
            cssClass: "copied",
          });

          toast.present();
        })
        .catch(async (err) => {
          // Error alert
          const errorAlert = await alertController.create({
            header: "Clipboard Error!",
            message: err,
            buttons: ["Okay!"],
          });
          errorAlert.present();
        });
    },
  },
  async mounted() {
    // Set ticker from route params
    this.ticker = this.$route.params.coin as string;

    // Set XPUB data property
    const xpub = this.wallet.getCoin(this.ticker).extendedPublicKey;
    this.xpub = xpub;

    // Create QR Code of XPUB
    await QRCode.toDataURL(xpub, { width: 200, margin: 1 }).then((qr) => {
      this.qrCode = qr;
    });
  },
  setup() {
    const wallet = hdWalletP2pkh;

    return {
      wallet,
      close
    };
  },
});
</script>