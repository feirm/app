<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Scan QR Code</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <p class="ion-text-center">Please scan a QR Code by placing it into the frame.</p>
      <qr-stream @decode="onDecode" class="qr-stream"></qr-stream>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonContent,
  IonTitle,
  IonIcon,
  alertController,
} from "@ionic/vue";
import { informationCircleOutline } from "ionicons/icons";
import { QrStream } from "vue3-qr-reader";

export default defineComponent({
  name: "Scan",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonBackButton,
    IonContent,
    IonTitle,
    IonIcon,
    QrStream
  },
  methods: {
    async presentAlert() {
      const alert = await alertController.create({
        header: "Information",
        message:
          "Use the QR Scanner to scan any QR Code. Depending on it's contents, the application will act accordingly.",
        buttons: ["Okay, got it!"],
      });
      return alert.present();
    },
    onDecode(decodedString: any) {
      alert(decodedString);
    }
  },
  setup() {
    return {
      informationCircleOutline,
    };
  },
});
</script>

<style scoped lang="css">
.qr-stream {
  width: 150px;
  height: 150px;
}
</style>