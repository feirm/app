<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-item v-for="contact in contacts" :key="contact.id" :button="true">
        {{ contact }}
      </ion-item>

      <!-- Floating button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          @click="router.push({ path: '/services/contacts/new' })"
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
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
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
  },
  data() {
    return {
      contacts: []
    }
  },
  async created() {
    try {
      await tatsuyaService.fetchContacts().then(res => {
        this.contacts = res.data;
      })
    } catch(e) {
      console.log("Fetching contacts error:", e.response.data.error);
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