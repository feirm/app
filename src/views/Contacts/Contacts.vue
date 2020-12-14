<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="refreshContacts($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-item v-for="contact in contacts" :key="contact.id" :button="true">
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
  IonRefresher,
  IonRefresherContent,
  modalController
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import tatsuyaService from "@/apiService/tatsuyaService";
import { DecryptContacts, Contact, EncryptedContact } from "@/lib/contacts";

// Components
import NewContact from "@/components/Contacts/NewContact.vue";

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
    IonRefresher,
    IonRefresherContent
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
          this.contacts = decryptedContacts;
        }).catch(e => {
          console.log(e);
        })
      })
    } catch(e) {
      // ...
    }
  },
  methods: {
    async newContactModal() {
      const modal = await modalController.create({
        component: NewContact
      });

      return modal.present();
    },
    async refreshContacts(event: any) {
      // Refresh contacts (tidy this later)
      try {
        await tatsuyaService.fetchContacts().then(res => {
          DecryptContacts(res.data).then(contacts => {
            this.contacts = contacts;
          })
        })
      } catch(e) {
        console.log("Fetching contacts error:", e);
      }

      // Introduce some delay before closing the refresher
      setTimeout(() => {
        event.target.complete();
      }, 1000)
    }
  },
  setup() {
    // Get router instance
    const router = useRouter();

    return {
      router,
      addOutline,
    };
  },
});
</script>