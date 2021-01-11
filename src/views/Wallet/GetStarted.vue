<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="transparent">
        <ion-buttons slot="secondary">
          <ion-back-button :icon="closeOutline" color="dark" @click="router.push({ path: '/' })"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-img src="/assets/logo.png"></ion-img>
            <h1>Feirm Wallet</h1>
            <p>
              It appears that you don't have a wallet created. Would you like to
              create a new one, or restore from a backup?
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button
        expand="block"
        @click="router.push({ path: '/wallet/newSeed' })"
        >Create Wallet</ion-button
      >
      <ion-button
        expand="block"
        color="light"
        @click="restorePrompt"
        >Restore from Backup</ion-button
      >
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonHeader,
  IonButton,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  alertController,
} from "@ionic/vue";
import { walletOutline, closeOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { DeriveWallet } from "@/lib/wallet";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonHeader,
    IonButton,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonBackButton
  },
  methods: {
    async restorePrompt() {
      const alert = await alertController.create({
        header: "Wallet Recovery",
        message:
          "Please enter your 24-word mnemonic which you backed up when originally creating your wallet.",
        inputs: [
          {
            name: "mnemonic",
            type: "text",
          },
        ],
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Restore Wallet",
            handler: async (inputs) => {
              // Derive an XFE wallet from the mnemonic
              try {
                const wallet = await DeriveWallet(inputs.mnemonic, "xfe");
                
                // Store wallet in localStorage
                localStorage.setItem("wallet", JSON.stringify(wallet));

                // Set state in Vuex
                this.store.commit("setWalletState", wallet);

                this.router.push({ path: "/tabs/wallet" });
              } catch (e) {
                const eAlert = await alertController.create({
                  header: "Recovery Error!",
                  message: e,
                  buttons: [
                    {
                      text: "Okay!",
                    },
                  ],
                });

                return eAlert.present();
              }
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
      walletOutline,
      closeOutline
    };
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 100px;
}

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