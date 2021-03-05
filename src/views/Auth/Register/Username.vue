<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <img
              width="64"
              style="margin: 0 auto"
              src="@/assets/img/logos/feirm.png"
              alt="Feirm Logo"
            />
            <ion-text class="ion-text-center">
              <h1>Let's create your Feirm account</h1>
              <p class="ion-text-left">
                With Feirm, you can create an account using a username or email
                address. If you intend to use a username (with no email
                address), there is no way to recover your account password.
              </p>
            </ion-text>

            <!-- Username/email and password -->
            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary"
                >Username or Email</ion-label
              >
              <ion-input v-model="username"></ion-input>
            </ion-item>
            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary"
                >Choose your password</ion-label
              >
              <ion-input type="password" v-model="password"></ion-input>
            </ion-item>

            <!-- Encryption key prompt text -->
            <ion-item-divider></ion-item-divider>
            <br>

            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary">Encryption key</ion-label>
              <ion-input type="password" v-model="encryptionKey"></ion-input>
            </ion-item>

            <ion-text class="ion-text-left">
              <p style="font-size: 0.75rem">
                Your encryption key is used to encrypt all data associated to
                your account. It is only accessible by you. The key never leaves
                your device, and it is never sent to any servers.
              </p>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="primary" @click="register"
        >Next</ion-button
      >
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonFooter,
  IonItemDivider
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

import { showErrorToast } from "@/utils/toast";

// Firebase
import firebase from "firebase";
import account from "@/class/account";

// OpenPGP
import { encrypt, EncryptOptions, Message } from "openpgp";

import bufferToHex from "@/lib/bufferToHex";

export default defineComponent({
  name: "RegisterUsername",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonFooter,
    IonItemDivider
  },
  data() {
    return {
      username: "",
      password: "",
      encryptionKey: ""
    };
  },
  methods: {
    async register() {
      // Derive a stretched key from the encryption key
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const key = await account.derivePassword(this.encryptionKey, bufferToHex(salt))

      // Generate a root key
      const rootKey = window.crypto.getRandomValues(new Uint8Array(1024));

      // Encrypt root key with PGP using stretched encryption key
      const options: EncryptOptions = {
        message: Message.fromBinary(rootKey),
        passwords: [bufferToHex(key)],
        armor: true
      };

      const ciphertext = await encrypt(options);
      console.log(ciphertext);

      // Submit account to Firebase
      // Determine whether or not the username is a username or email
      let usernameOrEmail = "";
      if (this.username && !this.username.includes("@")) {
        // Append a dummy email address to pass registration
        usernameOrEmail = this.username + "@users.feirm.com";
      } else {
        // Set the specified user's email address
        usernameOrEmail = this.username;
      }

      // Set the username/email to be stored in LocalStorage
      try {
        localStorage.setItem("username", this.username);
      } catch (e) {
        console.log("[Register] Error setting username:", e);
      }

      // Create an account on Firebase
      let credentials;
      try {
        credentials = await firebase
          .auth()
          .createUserWithEmailAndPassword(usernameOrEmail, this.password);

        // For testing send out a verification email
        await credentials.user.sendEmailVerification();
      } catch (e) {
        // Extract the error code
        const error = e.code;

        // Show an error toast depending on the message
        switch (error) {
          case "auth/weak-password": {
            await showErrorToast(
              "It looks like your password is too weak! Please pick another and try again."
            );
            break;
          }
          case "auth/email-already-in-use": {
            await showErrorToast(
              "The username or email address you have picked is already in use! Please try again."
            );
            break;
          }
          case "auth/invalid-email": {
            await showErrorToast(
              "There is an invalid character in your username! Please try again."
            );
            break;
          }
          default: {
            await showErrorToast(
              "Uh oh, it looks like there is a connectivity issue. Please try again later."
            );
            break;
          }
        }

        console.log("[Register] Error creating account:", error);
      }

      // User account must've been created, so output the credentials
      console.log(credentials.user);
    },
  },
  setup() {
    // Use existing router
    const router = useRouter();

    return {
      router,
    };
  },
});
</script>

<style scoped>
ion-grid {
  height: 100%;
}

ion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.ion-toast {
  text-align: center;
}
</style>