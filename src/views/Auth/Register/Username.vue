<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <img
        width="64"
        style="margin: 0 auto"
        src="@/assets/img/logos/feirm.png"
        alt="Feirm Logo"
      />

      <ion-grid>
        <ion-row>
          <ion-col>
            <!-- Welcome text -->
            <ion-text>
              <h1>Let's create your Feirm account!</h1>
              <p>All we need to get you started are a few details!</p>
            </ion-text>

            <!-- Username input -->
            <ion-item>
              <ion-label position="floating">Username or Email address</ion-label>
              <ion-input v-model="username"></ion-input>
            </ion-item>

            <!-- Password input -->
            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input v-model="password" :color="colourScore" type="password" @ionChange="checkPassword(password)"></ion-input>
            </ion-item>

            <!-- Encryption key input -->
            <ion-item>
              <ion-label position="floating">Encryption key</ion-label>
              <ion-input v-model="encryptionKey" :color="encColourScore" type="password" @ionChange="checkEncryptionPassword(encryptionKey)"></ion-input>
            </ion-item>

            <br />

            <ion-text style="font-size: 0.75rem" class="ion-text-left">
              <p>
                We use an additional password (encryption key) to further
                protect your data. If you forget this password, your data is
                un-recoverable! It is also important for this key to be
                different from your account password.
              </p>
              <p>
                Every time you launch Feirm, you will be prompted for this
                password to decrypt your data.
              </p>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="primary" :disabled="registerDisabled" @click="register">Register</ion-button>
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
  IonButton,
  IonText,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
} from "@ionic/vue";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

import { showErrorToast } from "@/utils/toast";

// Firebase
import firebase from "firebase";
import zxcvbn from "zxcvbn";
import { useStore } from "vuex";
import account from "@/class/account";
import authService from "@/apiService/authService";

export default defineComponent({
  name: "RegisterUsername",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonText,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonLabel,
    IonInput,
  },
  data() {
    return {
      username: "",
      password: "",
      encryptionKey: "",

      registerDisabled: true,
      colourScore: "",
      encColourScore: ""
    };
  },
  methods: {
    // Refactor the two following methods at some point...
    // Check the strength of account password
    checkPassword(password: string) {
      // Calculate zxcvbn score
      const score = zxcvbn(password).score;
      
      switch (score) {
        case 0: {
          this.colourScore = "danger"
          break
        }
        case 1: {
          this.colourScore = "danger"
          break
        }
        case 2: {
          this.colourScore = "danger"
          break
        }
        case 3: {
          this.colourScore = "warning"
          break
        }
        case 4: {
          this.colourScore = "success"
          break
        }
        default: {
          break
        }
      }
    },
    // Check the strength of the encryption password
    checkEncryptionPassword(password: string) {
      // Calculate zxcvbn score
      const score = zxcvbn(password).score;

      this.registerDisabled = true;
      
      switch (score) {
        case 0: {
          this.encColourScore = "danger"
          break
        }
        case 1: {
          this.encColourScore = "danger"
          break
        }
        case 2: {
          this.encColourScore = "danger"
          break
        }
        case 3: {
          this.encColourScore = "warning"
          this.registerDisabled = false;
          break
        }
        case 4: {
          this.encColourScore = "success"
          this.registerDisabled = false;
          break;
        }
        default: {
          break
        }
      }
    },
    async register() {
      // Check if account password and encryption password match
      if (this.password === this.encryptionKey) {
        const error = new Error("Account password and encryption key cannot match!")
        return await showErrorToast(error.message)
      }

      // Submit account to Firebase
      // Determine whether or not the username is a username or email
      let isEmail = false;
      let usernameOrEmail = "";
      if (this.username && !this.username.includes("@")) {
        // Append a dummy email address to pass registration
        usernameOrEmail = this.username + "@users.feirm.com";
        isEmail = false;
      } else {
        // Set the specified user's email address
        usernameOrEmail = this.username;
        isEmail = true;
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

        // If the user signed up with an email address, send out a verification email
        if (isEmail) {
          await credentials.user.sendEmailVerification();
        }

        // Save the JWT in Vuex
        const idToken = await credentials.user.getIdToken(true);
        this.store.dispatch("login", idToken);

        // Generate an account root key and encrypt it using OpenPGP.js
        const key = await account.generateAccountV2(this.encryptionKey)

        // Submit to key storage API
        const keyResponse = await authService.SendKey(key)
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
            // Something else has gone wrong, or we want to provide a custom error message
            await showErrorToast(e);
            break;
          }
        }

        console.log("[Register] Error creating account:", error);
      }
    },
  },
  setup() {
    // Use existing router and store
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store
    };
  },
});
</script>

<style scoped>
/* Center text in Toast */
.ion-toast {
  text-align: center;
}
</style>