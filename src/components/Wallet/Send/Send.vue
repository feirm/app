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
    <!-- Address input -->
    <ion-item lines="none" color="transparent">
      <ion-label position="stacked">Address</ion-label>
      <ion-input
        v-model="toAddress"
        type="text"
        v-on:ionChange="validateAddress($event.target.value)"
      ></ion-input>
    </ion-item>

    <!-- Amount input -->
    <ion-item lines="none" color="transparent">
      <ion-label position="stacked">Amount ({{ this.$props.ticker.toUpperCase() }})</ion-label>
      <ion-input v-model="amount" v-on:ionChange="calculateTotal($event.target.value)" type="number" min="0"></ion-input>
    </ion-item>

    <hr>

    <!-- Transaction fee -->
    <ion-item lines="none" color="transparent">
      <ion-label position="stacked">Transaction Fee ({{ this.$props.ticker.toUpperCase() }})</ion-label>
      <ion-input v-model="fee" disabled></ion-input>
    </ion-item>

    <!-- Total amount inc. fee -->
    <ion-item lines="none" color="transparent">
      <ion-label position="stacked">Amount including fee ({{ this.$props.ticker.toUpperCase() }})</ion-label>
      <ion-input v-model="total" disabled></ion-input>
    </ion-item>

    <!-- Floating send button -->
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="sendCoins" :disabled="sendDisabled">
        <ion-icon :icon="sendSharp"></ion-icon>
      </ion-fab-button>
    </ion-fab>
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
  IonFab,
  IonFabButton,
  modalController,
  alertController,
  loadingController,
} from "@ionic/vue";
import { Coin, CreateSignedTransaction } from "@/lib/wallet";
import ScanQR from "@/components/Wallet/ScanQR.vue";
import { sendSharp, qrCodeOutline, closeOutline, scanOutline } from "ionicons/icons";
import bip21 from "bip21";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import BigNumber from "bignumber.js";
import SendSuccess from "@/components/Wallet/Send/Success.vue";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import axios from "axios";

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
      fee: "",
      total: "",
      max: 0,
      sendDisabled: true,
    };
  },
  methods: {
    validateAddress(addressInput: string) {
      // Get network from ticker
      const network = hdWalletP2pkh.getNetwork(this.$props.ticker!);

      // Check address is valid
      try {
        toOutputScript(addressInput, network.p2pkh);
      } catch (e) {
        return this.sendDisabled = true;
      }

      this.sendDisabled = false;
    },
    // Calculate total including fees
    calculateTotal(amount: number) {
      const fee = new BigNumber(this.fee);
      const newAmount = new BigNumber(amount || 0);

      this.total = fee.plus(newAmount).toString()
    },
    async closeModal() {
      await modalController.dismiss();
    },
    async sendCoins() {
      // Convert amounts into Satoshis
      const amount = new BigNumber(this.amount).multipliedBy(100000000).toString();
      const fee = new BigNumber(this.fee).multipliedBy(100000000).toString();

      // Wrap in a loading controller
      await loadingController.create({
        message: "Creating & broadcasting transaction..."
      }).then(a => {
        a.present().then(async () => {
          // Fetch UTXOs
          const utxos = await hdWalletP2pkh.getUtxos(this.$props.ticker!);

          // Create and return a signed psbt
          const tx = hdWalletP2pkh.createSignedTransaction(this.$props.ticker!, this.toAddress, amount, fee, utxos);

          // Submit to Blockbook
          await hdWalletP2pkh.submitTx(this.$props.ticker!, tx.extractTransaction(true).toHex())

          // Dismiss modal
          a.dismiss();

          // Create success popup
          const success = await modalController.create({
            component: SendSuccess,
            componentProps: {
              amount: this.amount,
              ticker: this.$props.ticker!,
              address: this.toAddress
            }
          })

          return success.present();
        })
        // Error time!
        .catch(async e => {
          // Dismiss modal
          a.dismiss();

          // Create error alert
          const error = await alertController.create({
            header: "Error!",
            message: e,
            buttons: ["Close"]
          })

          return error.present();
        })
      })
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
          this.$props.coin!.toLowerCase()
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
  async created() {
    // Fetch a reasonable TX fee
    const blockbookUrl = hdWalletP2pkh.getBlockbook(this.$props.ticker!);

    // Set fee for 10 blocks confirmation
    const txFee = await axios.get(
      'https://cors-anywhere.feirm.com/'
      + blockbookUrl + 
      '/api/v2/estimatefee/10'
    )

    this.fee = txFee.data.result; 
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
    IonFab,
    IonFabButton
  },
});
</script>