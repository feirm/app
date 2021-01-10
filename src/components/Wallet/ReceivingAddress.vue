<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-left" color="transparent">
      <ion-title color="dark">Receive</ion-title>
      <ion-buttons slot="secondary">
        <ion-button @click="closeModal" color="dark">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center" v-if="qrCode.length !== 0">
    <ion-grid>
      <ion-row>
        <ion-col>
          <!-- QR Code -->
          <ion-card>
            <ion-card-content>
              <ion-img :src="qrCode"></ion-img>
            </ion-card-content>
          </ion-card>

          <br>

          <!-- Address text functionality -->
          <ion-text @click="copyToClipboard">
            <code>
              <p class="address">
                <b>{{ address }}</b>
              </p>
            </code>
          </ion-text>

          <br>

          <ion-button expand="block" @click="share">
            <ion-icon slot="start" :icon="shareSocial"></ion-icon>
              Share
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonText,
  IonImg,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  toastController,
  alertController,
  modalController,
  loadingController,
} from "@ionic/vue";
import {
  clipboard,
  shareSocial,
  close,
  helpCircleOutline,
} from "ionicons/icons";
import { FindWallet, DeriveAddress } from "@/lib/wallet";
import QRCode from "qrcode";
import bip21 from "bip21";

export default defineComponent({
  name: "ReceivingAddress",
  props: {
    coin: { type: String },
    ticker: { type: String },
  },
  data() {
    return {
      address: "",
      qrCode: "",
    };
  },
  async mounted() {
    // Wrap the entire address + qr derivation into a loading controller
    await loadingController
      .create({
        message: "Loading address...",
      })
      .then((a) => {
        a.present().then(async () => {
          // Derive an address for the coin based on the values we've got in this component.
          // Iterate and find the wallet for this coin
          await FindWallet(this.$props.ticker as string)
            .then(async (coin) => {
              // Derive a new address
              const address = await DeriveAddress(
                coin.extendedPublicKey,
                coin.ticker
              );

              // BIP21 compliant payment request
              const payment = bip21.encode(address, {}, this.$props.coin)

              // Generate a QR code of the address
              await QRCode.toDataURL(payment, { width: 200, margin: 1 }).then((qr) => {
                this.qrCode = qr;
              });

              this.address = address;

              // Dismiss the loading controller
              a.dismiss();
            })
            .catch(async (err) => {
              // If we've got an error, dismiss the loading controller and show a popup error
              a.dismiss();

              const errorAlert = await alertController.create({
                header: "Error!",
                message: err,
                buttons: ["Close"],
              });

              return errorAlert.present();
            });
        });
      });
  },
  methods: {
    share() {
      navigator.share({
        title: `${this.$props.coin as string} Address`,
        text: this.address,
      });
    },
    async copyToClipboard() {
      await navigator.clipboard
        .writeText(this.address)
        .then(async () => {
          const toast = await toastController.create({
            message: "Address was copied to your clipboard! ✅",
            duration: 2000,
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
    async closeModal() {
      await modalController.dismiss();
    },
    async help() {
      const alert = await alertController.create({
        header: "Seeing a new address?",
        message:
          "Feirm makes use of BIP32/44 to derive a new address each time a previous one has been used as an attempt to prevent you from being tracked.",
        buttons: ["Okay!"],
      });

      return alert.present();
    },
  },
  setup() {
    return {
      clipboard,
      shareSocial,
      close,
      helpCircleOutline,
    };
  },
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonText,
    IonImg,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  },
});
</script>

<style scoped>
.address {
  font-size: 12px;
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