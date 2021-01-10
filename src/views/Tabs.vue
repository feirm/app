<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="wallet" href="/tabs/wallet">
          <ion-icon :icon="walletOutline" />
          <ion-label>Wallet</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="marketplace" href="/tabs/marketplace">
          <ion-icon :icon="cartOutline" />
          <ion-label>Marketplace</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="contacts" href="/tabs/contacts">
          <ion-icon :icon="peopleOutline" />
          <ion-label>Contacts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personCircleOutline" />
          <ion-label>Profile</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
      </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
} from "@ionic/vue";
import {
  personCircleOutline,
  peopleOutline,
  walletOutline,
  compassOutline,
  cartOutline
} from "ionicons/icons";

export default {
  name: "Tabs",
  components: {
    IonLabel,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonPage,
  },
  setup() {
    return {
      personCircleOutline,
      peopleOutline,
      walletOutline,
      compassOutline,
      cartOutline
    };
  },
};
</script>