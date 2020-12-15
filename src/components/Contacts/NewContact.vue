<template>
  <ion-header>
    <ion-toolbar class="ion-text-center">
      <ion-buttons slot="start">
        <ion-button @click="closeModal" color="danger">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="secondary">
        <ion-button color="success" @click="saveContact(contact)">
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
          <ion-input v-model="contact.lastName" type="text"></ion-input>
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
  loadingController,
} from "@ionic/vue";
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { Contact, CreateEncryptedContact, CryptoAddress } from "@/lib/contacts";
import tatsuyaService from "@/apiService/tatsuyaService";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

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
        cryptoAddresses: [] as CryptoAddress[],
      } as Contact,
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
    async saveContact(contact: Contact) {
      // Wrap everything in a loading controller
      await loadingController
        .create({
          message: "Saving contact...",
        })
        .then((a) => {
          a.present()
            .then(async () => {
              // Encrypt the the contact payload
              await CreateEncryptedContact(
                contact
              ).then(async (data) => {
                // Submit payload to API
                await tatsuyaService.newContact(data);

                // Add contact to Vuex
                this.store.commit("addContact", contact)            

                // Close loading spinner
                a.dismiss();

                // Close the modal controller
                modalController.dismiss();
              });
            })
            .catch(async (err) => {
              // Dismiss loading controller
              a.dismiss();

              // Create error alert
              const alertError = await alertController.create({
                header: "Error saving contact!",
                message: err,
                buttons: ["Close"],
              });

              return alertError.present();
            });
        });
    },
  },
  setup() {
    // Check if a provided contact values are empty
    const empty = function (contact: Contact) {
      for (const key in contact) {
        if (contact[key] !== null && contact[key] != "") {
          return false;
        }
      }

      return true;
    };

    const router = useRouter();
    const store = useStore();

    return {
      checkmarkOutline,
      closeOutline,
      empty,
      router,
      store
    };
  },
});
</script>