<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Discover</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Content goes in here -->
      <ion-item-group>
        <ion-list-header>Explore the Feirm Ecosystem</ion-list-header>
        <ion-item lines="none" color="light" router-link="/services/qr" button="true">
          <ion-icon slot="end" :icon="qrCodeOutline" color="primary"></ion-icon>
          <ion-label>Scan QR Code</ion-label>
        </ion-item>
        <ion-item lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="newspaperOutline" color="primary"></ion-icon>
          <ion-label>News Feed</ion-label>
        </ion-item>
        <ion-item lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="cashOutline" color="primary"></ion-icon>
          <ion-label>Feirm Pay</ion-label>
        </ion-item>
        <ion-item lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="basketOutline" color="primary"></ion-icon>
          <ion-label>Marketplace</ion-label>
        </ion-item>
        <ion-item lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="gameControllerOutline" color="primary"></ion-icon>
          <ion-label>Games</ion-label>
        </ion-item>
        <ion-item lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="waterOutline" color="primary"></ion-icon>
          <ion-label>Faucet</ion-label>
        </ion-item>
      </ion-item-group>

      <br />

      <ion-item-group>
        <ion-list-header>Need assistance?</ion-list-header>
        <ion-item href="https://discord.gg/mUZdSKg" lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="logoDiscord" color="primary"></ion-icon>
          <ion-label>Discord</ion-label>
        </ion-item>
        <ion-item href="https://twitter.com/_feirm" lines="none" color="light" button="true">
          <ion-icon slot="end" :icon="logoTwitter" color="primary"></ion-icon>
          <ion-label>Twitter</ion-label>
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
  logoTwitter
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
    function checkFingerprint() {
      if (window.PublicKeyCredential) {
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(supported => {
          alert(supported)
        })
      } else {
        alert(false);
      }
    }

    return {
      qrCodeOutline,
      logoDiscord,
      cashOutline,
      newspaperOutline,
      basketOutline,
      gameControllerOutline,
      waterOutline,
      logoTwitter,
      checkFingerprint
    };
  },
};
</script>