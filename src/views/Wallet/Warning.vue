<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-icon
              :icon="alertCircleOutline"
              size="large"
              color="danger"
            ></ion-icon>
            <h1>Warning</h1>
            <p>
              Please note that this wallet is non-custodial and still under
              development. If you lose access to your funds, we are in no way
              responsible. You have been warned!
            </p>
            <ion-button>Okay, I understand!</ion-button>
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
import { alertCircleOutline } from "ionicons/icons";

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
  setup() {
    return {
      alertCircleOutline,
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