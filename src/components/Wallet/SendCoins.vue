<template>
  <ion-content class="ion-padding ion-text-center">
    <ion-item>
      <ion-label position="floating">To</ion-label>
      <ion-input
        v-model="toAddress"
        v-on:ionChange="validateAddress($event.target.value)"
      ></ion-input>
    </ion-item>
    <ion-item>
      <ion-label position="floating">Amount</ion-label>
      <ion-input v-model="amount" type="number"></ion-input>
      <ion-button slot="end" expand="block">Max</ion-button>
    </ion-item>
    <ion-item>
      <ion-note>
        <p>Spendable: 0 {{ this.$props.ticker.toUpperCase() }}</p>
      </ion-note>
    </ion-item>

    <!-- Send and Cancel buttons -->
    <ion-button expand="block" @click="sendCoins">Send Coins</ion-button>
    <ion-button expand="block" color="danger" @click="closeModal"
      >Cancel</ion-button
    >
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
  modalController,
  loadingController,
  alertController,
} from "@ionic/vue";
import { CreateSignedTransaction } from "@/lib/wallet";

export default defineComponent({
  name: "SendCoins",
  props: {
    coin: { type: String },
    ticker: { type: String },
  },
  data() {
    return {
      toAddress: "",
      amount: 0,
    };
  },
  methods: {
    validateAddress(address: string) {
      console.log(address);
    },
    async closeModal() {
      await modalController.dismiss();
    },
    async sendCoins() {
      const confirm = await alertController.create({
        header: "Confirm",
        message: `Are you sure you want to send <b>${
          this.amount
        } ${this.$props.ticker?.toUpperCase()}</b> to <b>${
          this.toAddress
        }</b>?`,
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
                  a.present().then(async () => {
                    // Create signed transactions
                    await CreateSignedTransaction(
                      this.$props.ticker as string,
                      this.toAddress,
                      this.amount
                    );

                    // Once complete, dismiss the loading controller
                    a.dismiss();
                  }).catch(async(e) => {
                    a.dismiss();

                    // Show error alert
                    const alert = await alertController.create({
                      header: "Transaction Error",
                      message: e,
                      buttons: ["Close"]
                    })

                    return alert.present()
                  });
                });
            },
          },
        ],
      });

      return confirm.present();
    },
  },
  setup() {
    return {
      CreateSignedTransaction,
    };
  },
  components: {
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonNote,
  },
});
</script>