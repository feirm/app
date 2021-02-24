<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title color="dark">Version</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen="true" class="ion-padding ion-text-center">
      <img width="128" style="margin: 0 auto;" src="@/assets/img/logos/feirm.png" alt="Feirm Logo">
      <br>
      <ion-note>The Feirm Platform is a secure and private web application built using amazing open source software!</ion-note>
      <p>Version {{ version }}</p>
      <ion-text color="primary">
        <p>Remember to always backup your keys!</p>
      </ion-text>

      <!-- Social medias -->
      <ion-item-group>
        <ion-item lines="full" button @click="navTo('https://twitter.com/_feirm')">
          <ion-icon slot="start" color="secondary" :icon="logoTwitter"></ion-icon>
          <ion-label>Follow us on Twitter</ion-label>
        </ion-item>
        <ion-item lines="full" button @click="navTo('https://t.me/feirm')">
          <ion-icon slot="start" color="secondary" :icon="paperPlane"></ion-icon>
          <ion-label>Telegram channel</ion-label>
        </ion-item>
        <ion-item lines="full" button @click="navTo('https://discord.gg/mUZdSKg')">
          <ion-icon slot="start" color="tertiary" :icon="logoDiscord"></ion-icon>
          <ion-label>Discord server</ion-label>
        </ion-item>
      </ion-item-group>
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
    IonButtons,
    IonBackButton,
    IonTitle,
    IonNote,
    IonText,
    IonItemGroup,
    IonItem,
    IonLabel,
    IonIcon
} from "@ionic/vue";
import {
  logoTwitter,
  logoDiscord,
  paperPlane
} from "ionicons/icons";
import { version } from "../../../package.json";

export default defineComponent({
  name: "Version",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonNote,
    IonText,
    IonItemGroup,
    IonItem,
    IonLabel,
    IonIcon
  },
  setup() {
    return {
      version,

      logoTwitter,
      logoDiscord,
      paperPlane
    }
  },
  methods: {
    navTo(url: string) {
      window.open(url);
    }
  }
});
</script>