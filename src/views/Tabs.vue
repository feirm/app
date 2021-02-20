<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="wallet" href="/tabs/wallet">
          <ion-icon :icon="walletOutline" />
        </ion-tab-button>

        <ion-tab-button tab="marketplace" href="/tabs/marketplace">
          <ion-icon :icon="cartOutline" />
        </ion-tab-button>

        <ion-tab-button tab="" disabled></ion-tab-button>

        <ion-tab-button tab="contacts" href="/tabs/contacts">
          <ion-icon :icon="peopleOutline" />
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personCircleOutline" />
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>

    <ion-fab vertical="bottom" horizontal="center" slot="fixed">
      <ion-fab-button color="light">
        <img width="36" src="@/assets/img/logos/feirm.png" />
      </ion-fab-button>
    </ion-fab>
  </ion-page>
</template>

<script lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonIcon,
  IonPage,
  IonFab,
  IonFabButton,
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
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonPage,
    IonFab,
    IonFabButton
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