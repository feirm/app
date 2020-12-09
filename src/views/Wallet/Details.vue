<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Feirm (XFE)</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding"> </ion-content>
    <ion-footer class="ion-no-border ion-padding">
        <ion-row>
          <ion-col>
            <ion-fab-button color="light" size="small">
              <ion-icon :icon="arrowUpOutline"></ion-icon>
            </ion-fab-button>
          </ion-col>
          <ion-col>
            <ion-fab-button color="light" size="small">
              <ion-icon :icon="refreshCircleOutline"></ion-icon>
            </ion-fab-button>
          </ion-col>
          <ion-col>
            <ion-fab-button color="light" size="small">
              <ion-icon :icon="settingsOutline"></ion-icon>
            </ion-fab-button>
          </ion-col>
        </ion-row>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonFabButton,
  IonIcon,
  IonRow,
  IonCol,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
} from "@ionic/vue";
import {
  arrowUpOutline,
  refreshCircleOutline,
  settingsOutline,
} from "ionicons/icons";

export default defineComponent({
  name: "Details",
  components: {
    IonPage,
    IonContent,
    IonFabButton,
    IonIcon,
    IonRow,
    IonCol,
    IonFooter,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonBackButton,
  },
  setup() {
    return {
      arrowUpOutline,
      refreshCircleOutline,
      settingsOutline,
    };
  },
});
</script>

<style scoped>
ion-footer {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>