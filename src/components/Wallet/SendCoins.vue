<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-left">
      <ion-title>Send {{ this.$props.ticker.toUpperCase() }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center">
    <!-- Amount input -->
    <ion-item>
      <ion-label position="stacked">Amount</ion-label>
      <ion-input v-model="amount" type="number" step="0.001"></ion-input>
    </ion-item>

    <!-- Address input -->
    <ion-item>
      <ion-input
        placeholder="Address"
        v-model="toAddress"
        v-on:ionChange="validateAddress($event.target.value)"
      ></ion-input>

      <ion-button color="light" @click="scanQr">
        <ion-icon slot="start" :icon="scanOutline"></ion-icon>
        Scan
      </ion-button>
    </ion-item>

    <!-- Send buttons -->
    <ion-button expand="block" @click="sendCoins" :disabled="sendDisabled">
      Send
      <ion-icon slot="end" :icon="sendSharp"></ion-icon>
    </ion-button>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  modalController,
  alertController,
} from "@ionic/vue";
import { Coin, CreateSignedTransaction } from "@/lib/wallet";
import ScanQR from "@/components/Wallet/ScanQR.vue";
import { sendSharp, qrCodeOutline, closeOutline, scanOutline } from "ionicons/icons";
import bip21 from "bip21";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";

export default defineComponent({
  name: "SendCoins",
  props: {
    coin: { type: String },
    ticker: { type: String },
  },
  data() {
    return {
      coinObj: {} as Coin,
      toAddress: "",
      amount: 0,
      fee: 0,
      max: 0,
      sendDisabled: true,
    };
  },
  async mounted() {
    const utxos = await hdWalletP2pkh.getUtxos(this.$props.ticker!, "200000000");
    console.log(utxos);
  },
  methods: {
    async validateAddress(address: string) {
      // Check that something is present
      if (address) {
        this.sendDisabled = false;
      } else {
        this.sendDisabled = true;
      }
    },
    async closeModal() {
      await modalController.dismiss();
    },
    async sendCoins() {
      console.log("Send coins....")
    },
    async scanQr() {
      const modal = await modalController.create({
        component: ScanQR,
      });

      await modal.present();

      // Get a response
      const modalResponse = await modal.onDidDismiss();

      // Decode the payment request
      // Example payment URI for Feirm:
      // feirm:5v3rs832d3ep8H8W3QY3y1BcAuFLBJ9ngo?amount=10.00000000&label=Test%20Payment&message=Test%20Message
      try {
        // If the modal response data is empty, just return
        if (!modalResponse.data) {
          return;
        }

        const decodedPayment = bip21.decode(
          modalResponse.data,
          this.coinObj.name.toLowerCase()
        );
        // Update the address and amount fields to match one on payment
        this.toAddress = decodedPayment.address;
        this.amount = decodedPayment.options.amount;
      } catch (e) {
        const alert = await alertController.create({
          header: "Error decoding payment request!",
          message: e,
          buttons: ["Close"],
        });

        return alert.present();
      }
    },
  },
  setup() {
    return {
      CreateSignedTransaction,
      sendSharp,
      qrCodeOutline,
      closeOutline,
      scanOutline
    };
  },
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
  },
});
</script>