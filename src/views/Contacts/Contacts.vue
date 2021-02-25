<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-item v-for="contact in contacts" :key="contact.id" :button="true" @click="viewContacts(contact.id)">
        {{ contact.firstName }} {{ contact.lastName }}
      </ion-item>

      <ion-grid v-if="contacts.length === 0">
        <ion-row>
          <ion-col>
            <ion-icon :icon="sadOutline" size="large"></ion-icon>
            <p>
              Oh no, it appears you don't have any contacts! Tap the add button
              at the bottom right to create one!
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Floating button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="newContactModal">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
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
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  modalController,
  loadingController,
  alertController,
} from "@ionic/vue";
import { addOutline, sadOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

// Components
import NewContact from "@/components/Contacts/NewContact.vue";
import ViewContact from "@/components/Contacts/ViewContact.vue";

import Contacts from "@/class/contacts";
import { Contact } from "@/models/contact";

export default defineComponent({
  name: "Contacts",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonItem,
    IonGrid,
    IonRow,
    IonCol,
  },
  data() {
    return {
      contacts: [] as Contact[]
    }
  },
  async mounted() {
    // Decrypt all contacts in our database
    // Wrap in a loading controller
    await loadingController.create({
      message: "Decrypting contacts..."
    }).then(a => {
      a.present().then(async () => {
        // Iterate over all of the contacts and decrypt them
        const contacts = await Contacts.getEncryptedContacts();

        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];
          const decryptedContact = await Contacts.decryptContact(contact.id);
          this.contacts.push(decryptedContact);
        }

        // Dimiss modal
        a.dismiss()
      })
      .catch(async e => {
        // Dismiss and show error
        a.dismiss();

        const error = await alertController.create({
          header: "Error decrypting your contacts",
          message: e,
          buttons: ["Close"]
        });

        return error.present();
      })
    })
  },
  methods: {
    async newContactModal() {
      const modal = await modalController.create({
        component: NewContact,
      });

      return modal.present();
    },
    async viewContacts(contactId: string) {
      const modal = await modalController.create({
        component: ViewContact,
        componentProps: {
          id: contactId,
        },
      });

      return modal.present();
    },
  },
  setup() {
    // Get router instance
    const router = useRouter();

    return {
      router,
      addOutline,
      sadOutline,
    };
  },
});
</script>

<style scoped>
/* Vertically centered */
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