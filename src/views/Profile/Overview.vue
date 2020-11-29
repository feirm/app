<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-button color="danger" expand="full" @click="logout"
        >Log out</ion-button
      >
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  alertController,
} from "@ionic/vue";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  },
  methods: {
    async logout() {
      const alert = await alertController.create({
        header: "Log out",
        message:
          "Are you sure you want to logout? This action will apply to all signed in devices.",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Yes, log me out!",
            handler: () => {
              console.log("Log out action!");
            },
          },
        ],
      });

      return alert.present();
    },
  },
});
</script>