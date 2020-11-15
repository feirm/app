<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button default-href="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>2FA</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
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
    IonIcon
  },
  data() {
    return {
      torchActive: false,
      torchNotSupported: false,
    };
  },
  methods: {
    async presentAlert() {
      const alert = await alertController.create({
        header: "Two Factor Authentication",
        message: "All Feirm accounts are protected via 2FA. If you lost access to your 2FA device, please contact the support team who can assist with downgrading your account.",
        buttons: ["Okay, got it!"],
      });
      return alert.present();
    }
  },
  setup() {
    return {
      informationCircleOutline
    };
  },
});
</script>