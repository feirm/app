<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal">
          <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-buttons slot="secondary">
        <ion-button color="danger" @click="deleteContact">
          <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content :fullscreen="true" class="ion-padding">
    <ion-item @click="copyToClipboard(contact.firstName)" button="true">
      <ion-label position="stacked">First Name</ion-label>
      {{ contact.firstName }}
    </ion-item>
    <ion-item @click="copyToClipboard(contact.lastName)" button="true">
      <ion-label position="stacked">Last Name</ion-label>
      {{ contact.lastName }}
    </ion-item>
    <ion-item @click="copyToClipboard(contact.phoneNumber)" button="true">
      <ion-label position="stacked">Phone Number</ion-label>
      {{ contact.phoneNumber }}
    </ion-item>
    <ion-item @click="copyToClipboard(contact.emailAddress)" button="true">
      <ion-label position="stacked">Email Address</ion-label>
      {{ contact.emailAddress }}
    </ion-item>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  modalController,
  alertController,
  toastController,
} from "@ionic/vue";
import { trashOutline, closeOutline } from "ionicons/icons";
import { Contact } from "@/lib/contacts";
import { useStore } from "vuex";
import tatsuyaService from "@/apiService/tatsuyaService";

export default defineComponent({
  name: "ViewContact",
  props: {
    id: {
      type: String,
    },
  },
  data() {
    return {
      contact: {} as Contact,
    };
  },
  mounted() {
    this.contact = this.store.getters.getContact(this.$props.id);
  },
  setup() {
    const store = useStore();

    return {
      store,
      trashOutline,
      closeOutline,
    };
  },
  methods: {
    async closeModal() {
      await modalController.dismiss();
    },
    async deleteContact() {
      // Create an alert asking if the user is sure they want to delete the contact
      const alert = await alertController.create({
        header: "Are you sure?",
        message: "Removing a contact is a permanent action.",
        buttons: [
          {
            text: "No",
          },
          {
            text: "Yes",
            handler: async () => {
              // Submit contact ID to Tatsuya API
              await tatsuyaService.deleteContact(this.$props.id as string).catch(async err => {
                const alert = await alertController.create({
                  header: "Error removing contact!",
                  message: err.response.data.error,
                  buttons: ["Close"]
                })

                return alert.present()
              })

              // Remove contact from Vuex
              this.store.commit("deleteContact", this.$props.id as string);

              // Dismiss the modal
              await modalController.dismiss();
            },
          },
        ],
      });

      return alert.present();
    },
    async copyToClipboard(field: any) {
       await navigator.clipboard
        .writeText(field)
        .then(async () => {
          const toast = await toastController.create({
            message: "Copied to your clipboard! ✅",
            duration: 2000,
          });

          toast.present();
        })
        .catch(async (err) => {
          // Error alert
          const errorAlert = await alertController.create({
            header: "Clipboard Error!",
            message: err,
            buttons: ["Okay!"],
          });
          errorAlert.present();
        });
    }
  },
  components: {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel
  },
});
</script>