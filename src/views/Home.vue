<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Feirm Account</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Feirm Account</ion-title>
        </ion-toolbar>
      </ion-header>
      <!-- Content goes in here -->
      <ion-card>
        <ion-card-content>
          <ion-grid>
            <ion-row class="ion-text-center">
              <ion-col>
                <ion-button router-link="/">
                  <ion-icon slot="icon-only" :icon="qrCodeOutline" />
                </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
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
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonIcon,
  IonButton
} from "@ionic/vue";

import {
  qrCodeOutline
} from "ionicons/icons"

export default {
  name: "Home",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonIcon,
    IonButton
  },
  setup() {
    return {
      qrCodeOutline
    }
  }
};
</script>