<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-button color="danger" expand="full" @click="logout"
        >Log out</ion-button
      >
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  alertController,
} from "@ionic/vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
  },
  methods: {
    async logout() {
      const alert = await alertController.create({
        header: "Log out",
        message:
          "Are you sure you want to logout? This action will apply to all signed in devices.",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Yes, log me out!",
            handler: async () => {
              await tatsuyaService.logoutAccount().then(() => {}).catch(e => {
                // Force logout anyway if something goes wrong
                this.store.dispatch("logout");
                this.router.push({ path: "/" })
              });

              // Clear Vuex state
              this.store.dispatch("logout");
              
              // Push to login page
              this.router.push({ path: '/' })
            },
          },
        ],
      });

      return alert.present();
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store
    }
  }
});
</script>