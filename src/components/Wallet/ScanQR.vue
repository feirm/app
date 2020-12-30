<template>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-button @click="closeQrScanner">
             <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Scan</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="fullscreen">
        <qr-stream
          @init="onInit"
          @decode="onDecode"
          :track="false"
          :torch="torchActive"
          :disabled="torchNotSupported"
        >
        </qr-stream>
      </div>
      <ion-fab
        v-if="!torchNotSupported"
        slot="fixed"
        vertical="bottom"
        horizontal="center"
        class="ion-padding-bottom"
      >
        <ion-button @click="torchActive = !torchActive">
          <ion-icon slot="icon-only" :icon="flashlightOutline"></ion-icon>
        </ion-button>
      </ion-fab>
    </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonTitle,
  IonIcon,
  alertController,
  modalController,
} from "@ionic/vue";
import { informationCircleOutline, flashlightOutline, closeOutline } from "ionicons/icons";
import { QrStream } from "vue3-qr-reader";

export default defineComponent({
  name: "Scan",
  components: {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonContent,
    IonTitle,
    IonIcon,
    QrStream,
  },
  data() {
    return {
      torchActive: false,
      torchNotSupported: true,
    };
  },
  methods: {
    async presentAlert() {
      const alert = await alertController.create({
        header: "Information",
        message:
          "Scan a QR code of an address or payment request, and the fields will automatically be populated for you!",
        buttons: ["Okay, got it!"],
      });
      return alert.present();
    },
    async onInit(promise: any) {
      try {
        const { capabilities } = await promise;

        this.torchNotSupported = !capabilities.torch;
      } catch (error) {
        console.error(error);
      }
    },
    onDecode(decodedString: string) {
      // Send the decoded string back to parent
      modalController.dismiss(decodedString);
    },
    closeQrScanner() {
      // Close QR scanner modal
      modalController.dismiss()
    }
  },
  setup() {
    return {
      informationCircleOutline,
      flashlightOutline,
      closeOutline
    };
  },
});
</script>

<style scoped>
.fullscreen {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: black;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}
</style>