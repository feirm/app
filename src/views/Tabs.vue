<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="discover" href="/tabs/discover">
          <ion-icon :icon="compassOutline" />
          <ion-label>Discover</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon :icon="walletOutline" />
          <ion-label>Wallet</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab2">
          <ion-icon :icon="peopleOutline" />
          <ion-label>Contacts</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab3">
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
import { personCircleOutline, peopleOutline, walletOutline, compassOutline } from "ionicons/icons";

export default {
  name: "Tabs",
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage },
  setup() {
    return {
      personCircleOutline,
      peopleOutline,
      walletOutline,
      compassOutline,
    };
  },
};
</script>