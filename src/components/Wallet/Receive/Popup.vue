<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-left" color="transparent">
      <ion-buttons slot="secondary">
        <ion-button color="light" @click="closeModal">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content
    :fullscreen="true"
    class="ion-padding ion-text-center"
    color="success"
  >
    <ion-grid>
      <ion-row>
        <ion-col>
          <ion-icon class="full-icon" :icon="checkmarkCircleOutline"></ion-icon>
          <p>You received <b>{{ $props.amount }} {{ $props.ticker }}</b></p>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
  <ion-footer class="ion-no-border ion-padding">
    <ion-button @click="closeModal" expand="block" color="dark"
      >Close</ion-button
    >
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  modalController,
} from "@ionic/vue";
import { close, checkmarkCircleOutline } from "ionicons/icons";

export default defineComponent({
  name: "ReceivePopup",
  components: {
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonFooter,
  },
  props: {
    amount: { type: String },
    ticker: { type: String },
  },
  setup() {

    // Dismiss/close the modal
    const closeModal = async function() {
        await modalController.dismiss();
    }

    return {
      close,
      checkmarkCircleOutline,
      closeModal
    };
  },
});
</script>

<style scoped>
/* Custom icon size */
.full-icon {
  font-size: 128px;
}

/* Vertical center grid */
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