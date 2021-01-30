<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Account information start -->
      <ion-note>My Account</ion-note>
      <br />
      <br />

      <ion-list lines="none">
        <ion-item>
          <ion-icon slot="start" color="primary" :icon="personOutline"></ion-icon>
          <ion-label>Username</ion-label>
          <ion-label slot="end" class="ion-text-right">{{ store.getters.getUsername }}</ion-label>
        </ion-item>

        <ion-item>
          <ion-icon slot="start" color="dark" :icon="moonOutline"></ion-icon>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle :checked="true"></ion-toggle>
        </ion-item>

        <!--
        <ion-item>
          <ion-icon slot="start" color="primary" :icon="keyOutline"></ion-icon>
          <ion-label>Identity Key</ion-label>
          <ion-label slot="end" class="ion-text-right"></ion-label>
        </ion-item>
        -->
      </ion-list>

      <br />
      <!-- Account information end -->

      <!-- Wallet actions start -->
      <ion-note>My Wallet</ion-note>
      <br />
      <br />

      <ion-list lines="none">
        <ion-item button="true" @click="encryptWalletPopup" :disabled="true">
          <ion-icon slot="start" color="primary" :icon="lockClosedOutline"></ion-icon>
          <ion-label>Encrypt Wallet</ion-label>
        </ion-item>
        <ion-item button="true" @click="deleteWallet" :disabled="!store.getters.walletExists">
          <ion-icon slot="start" color="danger" :icon="trashOutline"></ion-icon>
          <ion-label>Remove Wallet</ion-label>
        </ion-item>
      </ion-list>

      <br>
      <!-- Wallet actions end -->

      <!-- About information start -->
      <ion-note>About</ion-note>
      <br />
      <br />

      <ion-list lines="none">
        <ion-item>
          <ion-icon slot="start" color="primary" :icon="arrowDownOutline"></ion-icon>
          <ion-label>App Version</ion-label>
          <ion-label slot="end" class="ion-text-right">{{ version }}</ion-label>
        </ion-item>
        <ion-item button="true" href="https://feirm.com/privacy-policy">
          <ion-icon slot="start" color="primary" :icon="documentLockOutline"></ion-icon>
          <ion-label>Privacy Policy</ion-label>
        </ion-item>
      </ion-list>
      <!-- Wallet actions end -->
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button color="danger" @click="logout" expand="block">Log out</ion-button>
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
  IonFooter,
  IonNote,
  IonList,
  IonIcon,
  IonToggle,
  alertController,
  modalController,
  loadingController,
} from "@ionic/vue";
import {
  personOutline,
  keyOutline,
  trashOutline,
  lockClosedOutline,
  arrowDownOutline,
  documentLockOutline,
  moonOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { version } from "../../../package.json";
import PIN from "@/components/Auth/PIN.vue";
import { decryptWallet, encryptWallet } from "@/lib/encryptWallet";

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
    IonFooter,
    IonNote,
    IonList,
    IonIcon,
    IonToggle
  },
  methods: {
    async encryptWalletPopup() {
      // Show the PIN modal popup
      // Fetch a PIN first the first time
      const firstPin = await modalController.create({
        component: PIN,
        componentProps: {
          header: "Create a Wallet encryption PIN",
          description: "This six-digit PIN is used to encrypt your entire wallet."
        }
      })

      firstPin.present();

      // Extract the first PIN
      const pin = (await firstPin.onDidDismiss()).data;

      // If the response is less than 6 characters, assume its empty, or they wanted to cancel, so go no further
      if (pin.length < 6) {
        return;
      }

      // Fetch the PIN again so we can confirm they match
      const secondPin = await modalController.create({
        component: PIN,
        componentProps: {
          header: "Confirm your Wallet encryption PIN",
          description: "Please re-enter your six-digit Wallet encryption PIN."
        }
      })

      secondPin.present();

      // Extract the second (confirmation) PIN
      const confirmPin = (await secondPin.onDidDismiss()).data;

      // If the response is less than 6 characters, assume its empty, or they wanted to cancel, so go no further
      if (confirmPin.length < 6) {
        return;
      }

      // Compare the PINs against each other to make sure they match
      if (pin !== confirmPin) {
        const errorAlert = await alertController.create({
          header: "Encryption PIN Error!",
          message: "The Encryption PINs you provided do not match, please try again!",
          buttons: ["Close"],
          });
          
        errorAlert.present();

        // Go through the process again...
        this.encryptWalletPopup();
      }

      // Attempt to encrypt the wallet
      await loadingController.create({
        message: "Encrypting wallet..."
      }).then(a => {
        a.present().then(async() => {
          // Encrypt wallet and return its encrypted form
          const wallet = await encryptWallet(pin)

          // Save the encrypted wallet to localStorage
          localStorage.setItem("wallet", JSON.stringify(wallet));

          // Do something with the wallet, such as decrypt it, and then save it to Vuex
          const decryptedWallet = await decryptWallet(pin, wallet);
          this.store.commit("setWalletState", decryptedWallet);

          // Update the unlocked state
          this.store.commit("setWalletUnlock", true);

          // Set the wallet PIN state
          this.store.commit("setWalletPin", pin);

          // Dismiss the loading controller
          a.dismiss();
        })
        .catch(async e => {
          // Dismiss the loading controller
          a.dismiss()

          // Error alert
          const errorAlert = await alertController.create({
            header: "Wallet Encryption Error!",
            message: e,
            buttons: ["Close"],
          });
          
          errorAlert.present();
        })
      })

    },
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
        message:
          "Are you sure you want to delete your wallet? If you do not have your 24-word mnemonic phrase backed up, your funds are lost forever.",
        buttons: [
          {
            text: "No",
          },
          {
            text: "Yes",
            handler: async () => {
              this.store.dispatch("clearWallet");

              const alert = await alertController.create({
                header: "Operation successful!",
                message: "Your wallet was removed.",
                buttons: ["Okay"],
              });

              return alert.present();
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
      version,
      personOutline,
      keyOutline,
      trashOutline,
      lockClosedOutline,
      arrowDownOutline,
      documentLockOutline,
      moonOutline
    };
  },
});
</script>