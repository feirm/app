<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title color="dark">Device Security</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen="true" class="ion-padding ion-text-left">
      <ion-text>
        <p>
          It is no doubt that having to enter your account encryption key every
          time you launch the Feirm Platform is a massive inconvenience for
          some.
        </p>
        <p>
          To accomodate for our users who prioritise convenience over security,
          you can configure this specific device to always remember your
          encryption key while you are logged in.
        </p>
        <p>
          <i>As a general practice, we do not recommend doing this this!</i>
        </p>
        <p>
          If your device is already protected by biometric security or a strong
          password, enabling this option could save you some time when opening
          the Feirm Platform.
        </p>
        <p>
          Would you like this device to remember your account encryption key?
        </p>
      </ion-text>

      <!-- Key storage options -->
      <ion-radio-group @ionChange="check($event.target.value)">
        <ion-item color="transparent" lines="none">
          <ion-label>Do not remember</ion-label>
          <ion-radio slot="start" value="noremember"></ion-radio>
        </ion-item>
        <ion-item color="transparent" lines="none">
          <ion-label>Remember</ion-label>
          <ion-radio slot="start" value="remember"></ion-radio>
        </ion-item>
      </ion-radio-group>

      <!-- Prompt for key verification if they select "remember" or if we already have a key present -->
      <div v-if="remember && !savedKey">
        <br />
        <ion-item color="transparent">
          <ion-label position="floating"
            >Verify account encryption key</ion-label
          >
          <ion-input type="password" color="primary" v-model="password"></ion-input>
        </ion-item>
        <br />
        <ion-button @click="saveKey">Save encryption key</ion-button>
      </div>
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
  IonButtons,
  IonBackButton,
  IonTitle,
  IonText,
  IonLabel,
  IonItem,
  IonRadioGroup,
  IonRadio,
  IonInput,
  toastController,
} from "@ionic/vue";
import Account from "@/class/account";
import bufferToHex from "@/lib/bufferToHex";

export default defineComponent({
  name: "Version",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonText,
    IonLabel,
    IonItem,
    IonRadioGroup,
    IonRadio,
    IonInput,
  },
  data() {
    return {
      password: "",
      remember: false,
      savedKey: false,
    };
  },
  ionViewWillEnter() {
    // Check LocalStorage to see if we have an account encryption key present
    // Whether its the correct key or not is a different story...
    const encryptionKey = localStorage.getItem("encryptionKey");
    if (encryptionKey) {
      this.savedKey = true;
      this.remember = true;
    }
  },
  methods: {
    check(event) {
      // If the event is 'noremember', then remove the key from storage
      if (event === "noremember") {
        this.removeKey();
      }

      // If the event is to remember, then open up the remember prompt
      if (event === "remember") {
        this.remember = true;
      }
    },
    // Remove encryption key from localStorage
    async removeKey() {
      const key = localStorage.getItem("encryptionKey");

      // Only trigger if the key is present
      if (key) {
        localStorage.removeItem("encryptionKey");

        // Show a toast
        const alert = await toastController.create({
          message: "Encryption key has been removed from device storage!",
          color: "danger",
          duration: 3000,
        });

        alert.present();
      }

      // Reset state
      this.password = "";
      this.savedKey = false;
      this.remember = false;
    },
    // Save a stretched version of the users password
    async saveKey() {
      // Get the username and current account details from database
      const username = localStorage.getItem("username")!;
      const account = await Account.fetchAccountFromIDB(username);

      // Reconstruct the encryption key from the account details
      const secretKey = await Account.derivePassword(this.password, account.rootPasswordSalt);

      // Attempt to decrypt the root key with the provided password
      const rootKey = await Account.decryptAccount(secretKey, account);
      const keypair = await Account.deriveIdentityKeypair(rootKey);

      // Identity keypair public key does not match with the one we have for our account
      if (bufferToHex(keypair.publicKey) !== account.rootPublicKey) {
          const toast = await toastController.create({
              message: "Invalid account encryption key! Please try again.",
              duration: 3000,
              color: "danger"
          });

          return toast.present(); 
      }

      // Save the Hex encoded version of the key
      localStorage.setItem("encryptionKey", bufferToHex(secretKey));

      // Show a success toast
      const toast = await toastController.create({
          message: "Account encryption key has been saved to the device!",
          duration: 3000,
          color: "success"
      });

      return toast.present();
    },
  },
});
</script>