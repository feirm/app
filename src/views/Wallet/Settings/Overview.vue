<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-title color="dark">Settings</ion-title>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-text>
          Manage your cryptocurrency wallet. Please be sure you have a backup of your 24-word mnemonic phrase just in case something goes wrong here!
      </ion-text>

      <hr>
      <ion-button expand="block">Export / Backup</ion-button>
      <ion-button expand="block">Show XPUB</ion-button>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="danger" fill="clear" @click="deleteCoin" :disabled="store.getters.walletState.coins.length === 1">Remove Coin</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonBackButton,
  IonFooter,
  loadingController,
  alertController
} from "@ionic/vue";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "SettingsOverview",
  components: {
    IonPage,
    IonContent,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonBackButton,
    IonFooter
  },
  methods: {
    async deleteCoin() {
      // Fetch ticker from route parameter and delete the coin
      const ticker = this.$route.params.coin as string;

      // Wrap in loading popup
      await loadingController.create({
        message: "Removing coin..."
      }).then(a => {
        a.present()
        .then(async () => {
          // Delete coin wallet
          hdWalletP2pkh.deleteCoin(ticker);

          // Update transaction state
          await hdWalletP2pkh.getAllTransactions();

          // Dismiss
          a.dismiss();

          // Navigate back to home
          this.router.push("/");
        })
        .catch(async e => {
          // Dismiss and show error
          a.dismiss();

          const error = await alertController.create({
            header: "Error removing coin!",
            message: e,
            buttons: ["Close"]
          })

          return error.present();
        })
      });
    }
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