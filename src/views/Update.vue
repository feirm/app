<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-icon
              :icon="refreshCircleOutline"
              size="large"
            ></ion-icon>
            <h1>Update Available</h1>
            <p>
              There is a new update available for Feirm. Please click the button below to update!
            </p>
            <ion-button @click="updatePWA">Update</ion-button>
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
  IonContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonButton
} from "@ionic/vue";
import { refreshCircleOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  },
  methods: {
      updatePWA() {
          window.location.href = "/";
      }
  },
  setup() {
    return {
      refreshCircleOutline
    };
  },
});
</script>

<style scoped>
ion-grid {
  height: 100%;
}

ion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>