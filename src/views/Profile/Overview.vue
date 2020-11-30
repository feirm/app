<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-item-group>
        <ion-item>
          <ion-label slot="start">Name</ion-label>
          <ion-label slot="end">Name</ion-label>
        </ion-item>
        <ion-item>
          <ion-label slot="start">Feirm ID</ion-label>
          <ion-label slot="end">Username</ion-label>
        </ion-item>
      </ion-item-group>
      <br />
      <ion-button color="danger" @click="logout" expand="block">Log out</ion-button>
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
  IonItem,
  IonLabel,
  IonButton,
  IonItemGroup,
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
    IonItem,
    IonLabel,
    IonButton,
    IonItemGroup,
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
              await tatsuyaService.logoutAccount().catch((err) => {
                this.store.dispatch("logout");
                window.close();
              });

              // Clear Vuex state
              this.store.dispatch("logout");

              // Push to login page
              this.router.push({ path: "/" });
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
      store,
    };
  },
});
</script>