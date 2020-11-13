<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Scan QR Code</ion-title>
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
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonBackButton,
  IonContent,
  IonTitle,
  IonIcon,
  alertController,
} from "@ionic/vue";
import { informationCircleOutline, flashlightOutline } from "ionicons/icons";
import { QrStream } from "vue3-qr-reader";

export default defineComponent({
  name: "Scan",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonBackButton,
    IonContent,
    IonTitle,
    IonIcon,
    QrStream,
  },
  data() {
    return {
      torchActive: false,
      torchNotSupported: false,
    };
  },
  methods: {
    async presentAlert() {
      const alert = await alertController.create({
        header: "Information",
        message:
          "Scanning a QR Code is the fastest way to carry out certain actions on the Feirm Platform. It makes adding new friends and paying for things much faster!",
        buttons: ["Okay, got it!"],
      });
      return alert.present();
    },
    async qrAlert(data: any) {
      const alert = await alertController.create({
        header: "Successfully Scanned QR Code!",
        message: data,
        buttons: ["Ok"],
      });
      return alert.present();
    },
    async onInit(promise: any) {
      try {
        const { capabilities } = await promise;

        console.log(capabilities);

        this.torchNotSupported = !capabilities.torch;
      } catch (error) {
        console.error(error);
      }
    },
    onDecode(decodedString: string) {
      if (decodedString.length > 1) {
        this.qrAlert(decodedString);
      }
    },
  },
  setup() {
    return {
      informationCircleOutline,
      flashlightOutline
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