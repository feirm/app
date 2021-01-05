<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Marketplace</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-text class="ion-text-center">
            <p>
              Welcome to the Feirm Marketplace. Transact freely with complete
              privacy and security.
            </p>
          </ion-text>
          <ion-searchbar color="dark" animated></ion-searchbar>
        </ion-card-content>
      </ion-card>
      <ion-grid>
        <ion-row>
          <ion-col>
            <p><b>Recent Listings</b></p>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 1 </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 2 </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 3 </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";

export default defineComponent({
  name: "Overview",
  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonText,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
  },
});
</script>