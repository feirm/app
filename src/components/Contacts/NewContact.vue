<template>
  <ion-header>
    <ion-toolbar class="ion-text-center">
      <ion-buttons slot="start">
        <ion-button @click="closeModal" color="danger">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="secondary">
        <ion-button color="success">
          <ion-icon slot="icon-only" :icon="checkmarkOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title>Add a Contact</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content :fullscreen="true" class="ion-padding">
    <ion-card>
      <ion-card-content>
        <ion-item lines="none">
          <ion-label position="floating">First name</ion-label>
          <ion-input v-model="contact.firstName" type="text"></ion-input>
        </ion-item>
        <ion-item lines="none">
          <ion-label position="floating">Last name</ion-label>
          <ion-input v-model="contact.lastName" type="tel"></ion-input>
        </ion-item>
        <ion-item lines="none">
          <ion-label position="floating">Phone number</ion-label>
          <ion-input v-model="contact.phoneNumber" type="tel"></ion-input>
        </ion-item>
        <ion-item lines="none">
          <ion-label position="floating">Email address</ion-label>
          <ion-input v-model="contact.emailAddress" type="email"></ion-input>
        </ion-item>
      </ion-card-content>
    </ion-card>
    <ion-card>
      <ion-card-content>
        <ion-item lines="none">
          <ion-label position="floating">Cryptocurrency address</ion-label>
          <ion-input
            v-model="contact.cryptocurrencyAddress"
            type="text"
          ></ion-input>
        </ion-item>
      </ion-card-content>
    </ion-card>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonLabel,
  IonInput,
  IonItem,
  modalController,
  alertController,
} from "@ionic/vue";
import { checkmarkOutline, closeOutline } from "ionicons/icons";

export default defineComponent({
  name: "NewContact",
  components: {
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonLabel,
    IonInput,
    IonItem,
  },
  data() {
    return {
      contact: {
        firstName: "",
        lastName: "",
        phoneNumber: "",
        emailAddress: "",
        cryptocurrencyAddress: "",
      },
    };
  },
  methods: {
    async closeModal() {
      // Check if object fields are empty
      if (!this.empty(this.contact)) {
        const alert = await alertController.create({
          header: "Are you sure you want to exit?",
          message: "Any information on this page will not be saved!",
          buttons: [
            {
              text: "No",
            },
            {
              text: "Yes",
              handler: async () => {
                // Dismiss
                await modalController.dismiss();
              },
            },
          ],
        });

        return alert.present();
      }

      // Dismiss
      await modalController.dismiss();
    },
  },
  setup() {
    // Check if a provided objects values are empty
    const empty = function (obj: Record<string, string>) {
      for (const key in obj) {
        if (obj[key] !== null && obj[key] != "") {
          return false;
        }
      }

      return true;
    };

    return {
      checkmarkOutline,
      closeOutline,
      empty
    };
  },
});
</script>