<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-center">
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>{{ coin }} ({{ ticker.toUpperCase() }}) Address</ion-title>
      <ion-buttons slot="secondary">
        <ion-button @click="help">
          <ion-icon slot="icon-only" :icon="helpCircleOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center">
    <!-- QR Code -->
    <ion-img :src="qrCode"></ion-img>

    <!-- Address text functionality -->
    <ion-text>
      <code>
        <p class="address">
          <b>{{ address }}</b>
        </p>
      </code>
    </ion-text>

    <!-- Copy and share buttons -->
    <ion-button expand="block" @click="copyToClipboard">
      <ion-icon slot="start" :icon="clipboard"></ion-icon>
      Copy to clipboard
    </ion-button>
    <ion-button expand="block" @click="share">
      <ion-icon slot="start" :icon="shareSocial"></ion-icon>
      Share address
    </ion-button>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonImg,
  IonIcon,
  IonButton,
  IonButtons,
  toastController,
  alertController,
  modalController,
} from "@ionic/vue";
import {
  clipboard,
  shareSocial,
  close,
  helpCircleOutline,
} from "ionicons/icons";
import { FindWallet, DeriveAddress } from "@/lib/wallet";
import QRCode from "qrcode";

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
    // Derive an address for the coin based on the values we've got in this component.
    // Iterate and find the wallet for this coin
    await FindWallet(this.$props.ticker as string).then(async (coin) => {
      // Derive a new address
      const address = await DeriveAddress(coin.extendedPublicKey, coin.ticker);

      // Generate a QR code of the address
      await QRCode.toDataURL(address, { width: 200 }).then((qr) => {
        this.qrCode = qr;
      });

      this.address = address;
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
    IonContent,
    IonText,
    IonImg,
    IonIcon,
    IonButton,
    IonButtons,
  },
});
</script>

<style scoped>
.address {
  font-size: 12px;
}
</style>