<template>
  <ion-header>
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
    {{ contact.firstName }}
    {{ contact.lastName }}
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
  modalController,
  alertController,
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
  },
  components: {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
  },
});
</script>