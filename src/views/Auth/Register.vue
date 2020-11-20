<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-icon :icon="personCircleOutline" size="large"></ion-icon>
      <h1>Pick your username</h1>
      <p>This is how other Feirm users can find you and send you payments.</p>
      <ion-item>
        <ion-label position="floating">Username</ion-label>
        <ion-input></ion-input>
      </ion-item>
    </ion-content>
    <ion-button expand="full" color="dark">Next</ion-button>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
} from "@ionic/vue";
import { personCircleOutline } from "ionicons/icons";

export default defineComponent({
  name: "RegisterUsername",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
  },
  setup() {
    return {
      personCircleOutline,
    };
  },
});
</script>