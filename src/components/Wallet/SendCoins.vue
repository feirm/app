<template>
  <ion-header>
    <ion-toolbar class="ion-text-center">
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="secondary">
        <ion-button @click="presentAlert">
          <ion-icon
            slot="icon-only"
            :icon="informationCircleOutline"
          ></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Send {{ this.$props.ticker.toUpperCase() }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center">
    <ion-item>
      <ion-label position="stacked">To</ion-label>
      <ion-input
        v-model="toAddress"
        v-on:ionChange="validateAddress($event.target.value)"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="stacked">Amount</ion-label>
      <ion-input v-model="amount" type="number" step="0.001"></ion-input>
    </ion-item>
    <ion-item>
      <ion-note>
        <p>
          Spendable: {{ max }}
          {{ this.$props.ticker.toUpperCase() }}
        </p>
      </ion-note>
    </ion-item>

    <!-- Send buttons -->
    <ion-button expand="block" @click="sendCoins" :disabled="sendDisabled">
      Send
      <ion-icon slot="end" :icon="sendSharp"></ion-icon>
    </ion-button>

    <!-- QR Scan button -->
    <ion-fab slot="fixed" vertical="bottom" horizontal="center">
      <ion-fab-button @click="scanQr">
        <ion-icon :icon="qrCodeOutline"></ion-icon>
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
  IonNote,
  IonIcon,
  IonFab,
  IonFabButton,
  modalController,
  loadingController,
  alertController,
} from "@ionic/vue";
import { Coin, CreateSignedTransaction, FindWallet } from "@/lib/wallet";
import ScanQR from "@/components/Wallet/ScanQR.vue";
import { sendSharp, qrCodeOutline, closeOutline } from "ionicons/icons";
import axios from "axios";
import BigNumber from "bignumber.js";
import bip21 from "bip21";

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
      max: "",
      sendDisabled: false,
    };
  },
  methods: {
    async validateAddress(address: string) {
      console.log("Address:", address);
    },
    useMaxBalance() {
      this.amount = this.coinObj.balance / 100000000;
    },
    async closeModal() {
      await modalController.dismiss();
    },
    async sendCoins() {
      const confirm = await alertController.create({
        header: "Confirm",
        message: `Are you sure you want to continue?
        <br />
        <br />
        Address: <b>${this.toAddress}</b>
        <br />
        Amount: <b>${this.amount} ${this.$props.ticker?.toUpperCase()}</b>
        <br />
        TX Fee: <b>${this.fee} ${this.$props.ticker?.toUpperCase()}</b>
        <br />
        Total: <b>${new BigNumber(this.amount).plus(this.fee).toNumber()} ${this.$props.ticker?.toUpperCase()}</b>`,
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Confirm",
            handler: async () => {
              // Create a new loading popup
              await loadingController
                .create({
                  message: "Sending coins...",
                })
                .then((a) => {
                  a.present()
                    .then(async () => {
                      // Create signed transaction
                      const hash = await CreateSignedTransaction(
                        this.$props.ticker as string,
                        this.toAddress,
                        this.amount,
                        this.fee
                      );

                      // Once complete, dismiss the loading controller
                      a.dismiss();

                      // Show success alert
                      const alert = await alertController.create({
                        header: "Transaction Complete!",
                        message:
                          "The transaction was successful! (A fancy page will show here eventually).",
                        buttons: [
                          {
                            text: "View on explorer",
                            handler: async () => {
                              const explorer = this.coinObj.blockbook;
                              const url = explorer + "/tx/" + hash;

                              window.open(url);
                            },
                          },
                          {
                            text: "Close",
                            handler: async () => {
                              // Dismiss the send coins modal
                              await modalController.dismiss();
                            },
                          },
                        ],
                      });
                      return alert.present();
                    })
                    .catch(async (e) => {
                      a.dismiss();

                      // Determine error message to be shown
                      let errorMessage = "" as any;
                      errorMessage = e;

                      /*
                      switch (e.response.data.error) {
                        // TX Fee is not high enough
                        case "-26: 66: insufficient priority":
                          errorMessage = "Transaction fee is not high enough!";
                          break;
                        // Dust (TX is too small)
                        case "-26: 64: dust":
                          errorMessage =
                            "Transaction amount is too small (dust)!";
                          break;
                        default:
                          // Condition isn't met, just use error from HTTP request
                          errorMessage = "Something unexpected occurred";
                          break;
                      }
                      */

                      // Show error alert
                      const alert = await alertController.create({
                        header: "Transaction Error",
                        message: errorMessage,
                        buttons: ["Close"],
                      });

                      return alert.present();
                    });
                });
            },
          },
        ],
      });

      return confirm.present();
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
        const decodedPayment = bip21.decode(modalResponse.data, this.coinObj.name.toLowerCase());
        // Update the address and amount fields to match one on payment
        this.toAddress = decodedPayment.address;
        this.amount = decodedPayment.options.amount;
      } catch (e) {
        const alert = await alertController.create({
          header: "Error decoding payment request!",
          message: e,
          buttons: ["Close"]
        })

        return alert.present()
      }
    },
  },
  async mounted() {
    // Loading popup saying "fetching data"
    await loadingController.create({
      message: "Fetching data..."
    })
    .then(a => {
      a.present().then(async () => {
        // Find coin based on ticker and set coin data
        await FindWallet(this.$props.ticker!).then((coin) => {
          this.coinObj = coin as Coin;
          this.max = (this.coinObj.balance / 100000000).toFixed(2);
        });

        // Fetch ideal transaction fee for transaction to be confirmed
        // within 25 blocks.
        const txFee = await axios.get(
          "https://cors-anywhere.feirm.com/" +
          this.coinObj.blockbook +
          "/api/v2/estimatefee/25"
        )

        this.fee = Number(txFee.data.result);

        // Dismiss
        a.dismiss()
      }).catch(async e => {
        // Dismiss
        a.dismiss();

        // Show alert
        const errorAlert = await alertController.create({
          header: "Error fetching data!",
          message: e,
          buttons: ["Close"]
        })

        return errorAlert.present();
      })
    })
  },
  setup() {
    return {
      CreateSignedTransaction,
      sendSharp,
      qrCodeOutline,
      closeOutline,
    };
  },
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonNote,
    IonIcon,
    IonFab,
    IonFabButton,
  },
});
</script>