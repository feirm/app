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
          <ion-label>Feirm ID: {{ store.getters.getUsername }}</ion-label>
        </ion-item>
      </ion-item-group>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="light" @click="deleteWallet" expand="block" :disabled="!walletPresent">Delete wallet</ion-button>
      <ion-button color="danger" @click="logout" expand="block">Log out</ion-button>
      <ion-note>Feirm - v{{ version }}</ion-note>
    </ion-footer>
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
  IonFooter,
  IonNote,
  alertController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { version } from "../../../package.json";

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
    IonFooter,
    IonNote
  },
  data() {
    return {
      walletPresent: true
    }
  },
  methods: {
    async logout() {
      const alert = await alertController.create({
        header: "Are you sure?",
        message:
          "This action will remove all data from the app, including wallets, so be sure you have a backup!",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Yes, log me out!",
            handler: () => {
              // Clear Vuex state
              this.store.dispatch("logout");
              this.store.dispatch("deleteWallet");

              // Push to login page
              this.router.push({ path: "/" });
            },
          },
        ],
      });

      return alert.present();
    },
    async deleteWallet() {
      const alert = await alertController.create({
        header: "Delete wallet",
        message: "Are you sure you want to delete your wallet? If you do not have your 24-word mnemonic phrase backed up, your funds are lost forever.",
        buttons: [
          {
            text: "No"
          },
          {
            text: "Yes",
            handler: async () => {
              this.walletPresent = false;
              this.store.commit("deleteWalletState")

              const alert = await alertController.create({
                header: "Operation successful!",
                message: "Your wallet was removed.",
                buttons: ["Okay"]
              });

              return alert.present();
            }
          }
        ]
      })

      return alert.present();
    }
  },
  ionViewWillEnter() {
    // Check if wallet is present
    this.walletPresent = this.store.getters.isWalletPresent;
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      version
    };
  },
});
</script>