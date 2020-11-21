<template>
  <ion-page>
    <ion-toolbar class="ion-text-center">
      <ion-title>Wallets</ion-title>
    </ion-toolbar>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header color="primary">
          <ion-card-title>Feirm Wallets</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item lines="none" button="true">
              <ion-icon
                :icon="walletOutline"
                size="large"
                slot="start"
              ></ion-icon>
              <ion-label>Personal</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
  },
  setup() {
    return {
      walletOutline,
    };
  },
});
</script>

<style scoped>
ion-card-header {
  padding-top: 0.4em;
  padding-bottom: 0.4em;
}

ion-card-title {
  font-size: 1rem;
  font-weight: bold;
}
</style>