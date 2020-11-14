<template>
  <ion-page>
       <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle
} from "@ionic/vue";
import { alertCircleOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle
  },
  setup() {
    return {
      alertCircleOutline,
    };
  },
});
</script>