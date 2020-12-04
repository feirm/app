<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-item v-for="contact in contacts" :key="contact" :button="true">
        <ion-avatar slot="start">
          <img
            src="https://avatars0.githubusercontent.com/u/33553891?s=200&v=4"
          />
        </ion-avatar>
        <p>{{ contact.FirstName }} {{ contact.LastName }}</p>
      </ion-item>

      <!-- Floating button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="router.push({ path: '/services/contacts/new' })">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Contact } from "@/lib/contacts";
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
  IonAvatar,
  loadingController,
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

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
    IonAvatar,
  },
  async created() {
    // Simulate loading
    const loading = await loadingController.create({
      message: "Fetching and decrypting contacts...",
      duration: 2000,
    });

    await loading.present();
  },
  setup() {
    // Get router instance
    const router = useRouter();

    const contacts: Contact[] = [];

    /* TODO
    1. Fetch encrypted contact blobs
    2. Decrypt encrypted blob into contacts array
    */

    // Example contact
    const exampleContact = {
      FirstName: "Feirm",
      LastName: "Blockchain",
    } as Contact;

    contacts.push(exampleContact);

    return {
      router,
      contacts,
      addOutline,
    };
  },
});
</script>