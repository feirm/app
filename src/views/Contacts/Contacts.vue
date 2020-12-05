<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-item v-for="contact in contacts" :key="contact.id" :button="true">
        {{ contact.id }}
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
import { defineComponent, ref } from "vue";
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
  created() {
    this.fetchContacts();
    console.log(this.data);
  },
  setup() {
    // Get router instance
    const router = useRouter();

    const data = ref(null);
    const error = ref(null);

    const fetchContacts = async () => {
      try {
        const response = await tatsuyaService.fetchContacts();
        data.value = response.data;
      } catch (e) {
        error.value = e;
      }
    }

    return {
      router,
      data,
      error,
      fetchContacts,
      addOutline,
    };
  },
});
</script>