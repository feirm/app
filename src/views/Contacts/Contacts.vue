<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button>
            <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding"></ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { addCircleOutline } from "ionicons/icons";

export default defineComponent({
  name: "Contacts",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
  },
  setup() {
    return {
      addCircleOutline,
    };
  },
});
</script>