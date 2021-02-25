<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-title>Contacts</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-item v-for="contact in store.getters.getAllContacts" :key="contact.id" :button="true" @click="viewContacts(contact.id)">
        {{ contact.firstName }} {{ contact.lastName }}
      </ion-item>

      <ion-grid v-if="store.getters.getAllContacts.length === 0">
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
} from "@ionic/vue";
import { addOutline, sadOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

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
    IonGrid,
    IonRow,
    IonCol,
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

    const store = useStore();

    return {
      router,
      store,
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