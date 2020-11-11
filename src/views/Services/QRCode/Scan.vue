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
    <ion-content :fullscreen="true" class="ion-padding"> Hello </ion-content>
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
  },
  setup() {
    return {
      informationCircleOutline,
    };
  },
});
</script>