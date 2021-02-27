<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-item
        v-for="contact in contacts"
        :key="contact.id"
        :button="true"
        @click="viewContacts(contact)"
      >
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
import { Contact, EncryptedContact } from "@/models/contact";
import tatsuyaService from "@/apiService/tatsuyaService";

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
      contacts: [] as Contact[],
    };
  },
  async mounted() {
    // Fetch all of our encrypted contacts
    try {
      await tatsuyaService.fetchContacts().then(async (res) => {
        // Set the encrypted contacts array
        const contacts = res.data as EncryptedContact[];
        if (!contacts) {
          return;
        }

        // Store contacts in IDB
        for (let i = 0; i < contacts.length; i++) {
          Contacts.addContact(contacts[i]);
        }
      });
    } catch (e) {
      throw new Error(e);
    }

    // Decrypt all contacts in our database
    const contacts = await Contacts.getEncryptedContacts();
    if (contacts.length === 0) {
      return;
    }

    // Wrap in a loading controller
    await loadingController
      .create({
        message: "Decrypting contacts...",
      })
      .then((a) => {
        a.present()
          .then(async () => {
            // Iterate over all of the contacts and decrypt them
            for (let i = 0; i < contacts.length; i++) {
              const contact = contacts[i];
              const decryptedContact = await Contacts.decryptContact(
                contact.id
              );
              this.contacts.push(decryptedContact);
            }

            // Dimiss modal
            a.dismiss();
          })
          .catch(async (e) => {
            // Dismiss and show error
            a.dismiss();

            const error = await alertController.create({
              header: "Error decrypting your contacts",
              message: e,
              buttons: ["Close"],
            });

            return error.present();
          });
      });
  },
  methods: {
    async newContactModal() {
      const modal = await modalController.create({
        component: NewContact,
      });

      await modal.present();

      // TODO: This code has been duplicated, so refactor it into its own method at some point... 
      // Capture dismiss response
      await modal.onDidDismiss().then(async () => {
        // Fetch new contacts as its possible the database has been updated
        const contacts = await Contacts.getEncryptedContacts();
        const contactsArray: Contact[] = [];

        // Decrypt all the contacts
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];

          // Otherwise go ahead and decrypt the contact and add it to our temporary array
          const decryptedContact = await Contacts.decryptContact(contact.id);
          contactsArray.push(decryptedContact);
        }

        // Update the data of contacts we want to show
        this.contacts = contactsArray;
      });
    },
    async viewContacts(contact: Contact) {
      const modal = await modalController.create({
        component: ViewContact,
        componentProps: {
          contact: contact,
        },
      });

      await modal.present();

      // Capture dismiss response
      await modal.onDidDismiss().then(async () => {
        // Fetch new contacts as its possible the database has been updated
        const contacts = await Contacts.getEncryptedContacts();
        const contactsArray: Contact[] = [];

        // Decrypt all the contacts
        for (let i = 0; i < contacts.length; i++) {
          const contact = contacts[i];

          // Otherwise go ahead and decrypt the contact and add it to our temporary array
          const decryptedContact = await Contacts.decryptContact(contact.id);
          contactsArray.push(decryptedContact);
        }

        // Update the data of contacts we want to show
        this.contacts = contactsArray;
      });
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