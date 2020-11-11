<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Discover</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Feirm Account</ion-title>
        </ion-toolbar>
      </ion-header>
      <!-- Content goes in here -->
      <ion-item-group>
        <ion-list-header>Explore the Feirm Ecosystem</ion-list-header>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="qrCodeOutline"></ion-icon>
          <ion-label>Scan QR Code</ion-label>
        </ion-item>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="newspaperOutline"></ion-icon>
          <ion-label>News Feed</ion-label>
        </ion-item>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="cashOutline"></ion-icon>
          <ion-label>Feirm Pay</ion-label>
        </ion-item>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="basketOutline"></ion-icon>
          <ion-label>Marketplace</ion-label>
        </ion-item>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="gameControllerOutline"></ion-icon>
          <ion-label>Games</ion-label>
        </ion-item>
        <ion-item lines="none" color="light">
          <ion-icon slot="end" :icon="waterOutline"></ion-icon>
          <ion-label>Faucet</ion-label>
        </ion-item>
      </ion-item-group>

      <br />

      <ion-item-group>
        <ion-list-header>Need assistance?</ion-list-header>
        <ion-item href="https://discord.gg/mUZdSKg" lines="none" color="light">
          <ion-icon slot="end" :icon="logoDiscord"></ion-icon>
          <ion-label>Discord</ion-label>
        </ion-item>
      </ion-item-group>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonItemGroup,
  IonListHeader,
} from "@ionic/vue";

import {
  qrCodeOutline,
  logoDiscord,
  cashOutline,
  newspaperOutline,
  basketOutline,
  gameControllerOutline,
  waterOutline,
} from "ionicons/icons";

export default {
  name: "Discover",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonItem,
    IonLabel,
    IonItemGroup,
    IonListHeader,
  },
  setup() {
    return {
      qrCodeOutline,
      logoDiscord,
      cashOutline,
      newspaperOutline,
      basketOutline,
      gameControllerOutline,
      waterOutline,
    };
  },
};
</script>