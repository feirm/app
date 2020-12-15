<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-item v-for="contact in store.getters.getAllContacts" :key="contact.id" :button="true" @click="viewContacts(contact.id)">
        {{ contact.firstName}} {{ contact.lastName }}
      </ion-item>

      <!-- Floating button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          @click="newContactModal"
        >
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
  modalController,
  alertController
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import tatsuyaService from "@/apiService/tatsuyaService";
import { DecryptContacts, Contact, EncryptedContact } from "@/lib/contacts";

// Components
import NewContact from "@/components/Contacts/NewContact.vue";
import ViewContact from "@/components/Contacts/ViewContact.vue";

import { useStore } from "vuex";

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
  },
  data() {
    return {
      contacts: [] as Contact[]
    }
  },
  async ionViewWillEnter() {
    try {
      await tatsuyaService.fetchContacts().then(async(res) => {
        // Set the encrypted contacts array
        const contacts = res.data as EncryptedContact[];

        // Attempt to decrypt contacts array
        await DecryptContacts(contacts).then(decryptedContacts => {
          this.store.commit("setContacts", decryptedContacts)
        }).catch(e => {
          console.log(e);
        })
      })
    } catch(e) {
      const error = await alertController.create({
        header: "Error fetching contacts!",
        message: e,
        buttons: ["Close"]
      });

      return error.present();
    }
  },
  methods: {
    async newContactModal() {
      const modal = await modalController.create({
        component: NewContact
      });

      return modal.present();
    },
    async viewContacts(contactId: string) {
      const modal = await modalController.create({
        component: ViewContact,
        componentProps: {
          id: contactId
        }
      })

      return modal.present();
    }
  },
  setup() {
    // Get router instance
    const router = useRouter();

    const store = useStore();

    return {
      router,
      store,
      addOutline,
    };
  },
});
</script>