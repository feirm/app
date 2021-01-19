<template>
  <ion-content
    :fullscreen="true"
    class="ion-padding ion-text-center"
    @click="closeModal"
  >
    <ion-grid>
      <ion-row>
        <ion-col>
          <ion-icon class="full-icon" :icon="checkmarkCircleOutline" color="primary" ></ion-icon>
          <p>You received <b>{{ $props.amount }} {{ $props.ticker }}</b></p>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
  <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-text>
          <p class="small-text">Tap anywhere to exit</p>
      </ion-text>
  </ion-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
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

/* Small text */
.small-text {
    font-size: 14px;
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