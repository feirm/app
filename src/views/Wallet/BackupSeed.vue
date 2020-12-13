<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Verifying your seed</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-text>
        <p>
          To make sure that you have written down your seed, we are going to ask
          you to enter 3 words of the seed. Please enter the
          {{ ordinal(firstWordNumber) }}, {{ ordinal(secondWordNumber) }} and
          {{ ordinal(thirdWordNumber) }} word of the seed phrase in order to
          continue.
        </p>
      </ion-text>

      <!-- Seed phrase word entry -->
      <ion-item-group>
        <ion-item>
          <ion-label position="stacked"
            >{{ ordinal(firstWordNumber) }} word</ion-label
          >
          <ion-input v-model="firstWord" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked"
            >{{ ordinal(secondWordNumber) }} word</ion-label
          >
          <ion-input v-model="secondWord" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked"
            >{{ ordinal(thirdWordNumber) }} word</ion-label
          >
          <ion-input v-model="thirdWord" type="text"></ion-input>
        </ion-item>
      </ion-item-group>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding">
      <ion-button expand="block" @click="verify">Verify</ion-button>
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
  IonText,
  IonBackButton,
  IonButton,
  IonFooter,
  IonItemGroup,
  IonItem,
  IonInput,
  IonLabel,
  alertController,
} from "@ionic/vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { DeriveWallet } from "@/lib/wallet";

export default defineComponent({
  name: "NewSeed",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonText,
    IonBackButton,
    IonButton,
    IonFooter,
    IonItemGroup,
    IonItem,
    IonInput,
    IonLabel,
  },
  data() {
    return {
      firstWordNumber: Math.floor(Math.random() * 23) + 1,
      secondWordNumber: Math.floor(Math.random() * 23) + 1,
      thirdWordNumber: Math.floor(Math.random() * 23) + 1,

      firstWord: "",
      secondWord: "",
      thirdWord: "",
    };
  },
  methods: {
    ordinal: function (n: any) {
      const s = ["th", "st", "nd", "rd"],
        v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },
    async verify() {
      const mnemonic = this.store.getters.getWalletMnemonic;
      const splitMnemonic = mnemonic.split(" ");

      const alert = await alertController.create({
        header: "Verification failed!",
        message: "Please check that you inputted the seed words correctly.",
        buttons: ["Okay"],
      });

      if (!splitMnemonic.includes(this.firstWord)) {
        return alert.present();
      }

      if (!splitMnemonic.includes(this.secondWord)) {
        return alert.present();
      }

      if (!splitMnemonic.includes(this.thirdWord)) {
        return alert.present();
      }

      // If all is valid, then move on...
      const congratulationsAlert = await alertController.create({
        header: "Congratulations! 🥳",
        message: "You have successfully verified your 24-word mnemonic!",
        buttons: [
          {
            text: "Okay",
            handler: async () => {
              // Generate a wallet with Feirm as a coin
              await DeriveWallet(this.store.getters.getWalletMnemonic, "xfe").then(wallet => {
                // Save our wallet
                this.store.commit("setWalletState", wallet);

                // Navigate to wallets page
                this.router.push({ path: "/tabs/wallet" });
              });
            },
          },
        ],
      });

      return congratulationsAlert.present();
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
    };
  },
});
</script>