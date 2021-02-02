<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-title color="dark">Settings</ion-title>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-text>
          Manage your cryptocurrency wallet. Please be sure you have a backup of your 24-word mnemonic phrase just in case something goes wrong here!
      </ion-text>

      <hr>
      <ion-button expand="block">Export / Backup</ion-button>
      <ion-button expand="block">Show XPUB</ion-button>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="danger" fill="clear">Remove Coin</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonFooter
} from "@ionic/vue";

export default defineComponent({
  name: "SettingsOverview",
  components: {
    IonPage,
    IonContent,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton,
    IonFooter
  },
});
</script>