<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-img src="/assets/logo.png" alt="Feirm Logo"></ion-img>
            <ion-text class="ion-text-center">
              <h1>Welcome to Feirm.</h1>
              <p>Please Login or Create An Account to continue.</p>
            </ion-text>
            <ion-card color="transparent">
              <ion-card-content>
                <form @submit.prevent="login">
                  <ion-item color="transparent" lines="none">
                    <ion-label position="floating" color="primary">Username</ion-label>
                    <ion-input v-model="username"></ion-input>
                  </ion-item>
                  <ion-item color="transparent" lines="none">
                    <ion-label position="floating" color="primary">Password</ion-label>
                    <ion-input v-model="password" type="password"></ion-input>
                  </ion-item>
                  <br />
                  <ion-button expand="block" type="submit">Login</ion-button>
                </form>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="dark" @click="register"
        >Create an Account</ion-button
      >
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonImg,
  IonText,
  IonLabel,
  IonInput,
  IonItem,
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonRow,
  IonGrid,
  IonFooter,
  modalController,
  loadingController,
  alertController,
} from "@ionic/vue";
import { useStore } from "vuex";

import PIN from "@/components/Auth/PIN.vue";
import { useRouter } from "vue-router";
import tatsuyaService from "@/apiService/tatsuyaService";
import { AuthenticationToken, EncryptedAccount } from "@/models/account";
import Account from "@/class/account";

export default defineComponent({
  name: "Login",
  components: {
    IonPage,
    IonContent,
    IonImg,
    IonText,
    IonLabel,
    IonInput,
    IonItem,
    IonButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonRow,
    IonGrid,
    IonFooter,
  },
  data() {
    return {
      username: "",
      password: "",
      isLoading: false,
    };
  },
  methods: {
    async login() {
      if (this.username.length < 3) {
        return;
      }
      if (this.password.length < 1) {
        return;
      }

      // Open the PIN entry component to fetch the user PIN
      const pinEntry = await modalController.create({
        component: PIN,
        componentProps: {
          header: "Enter your PIN",
          description: "Enter the six-digit PIN for your Feirm account.",
        },
      });

      pinEntry.present();

      // Wait for a response to get our PIN
      const pinResponse = await pinEntry.onDidDismiss();
      const pin = pinResponse.data;

      // If the response is less than 6 characters, assume its empty, or they wanted to cancel, so go no further
      if (pin.length < 6) {
        return;
      }

      // Attempt to sign in
      await loadingController
        .create({
          message: "Signing you in...",
        })
        .then(async (a) => {
          a.present()
          .then(async () => {
            // Submit username and PIN to authentication API
            // to retrieve encrypted payload
            const encryptedAccount = await (await tatsuyaService.fetchEncryptedAccount(this.username, pin)).data as EncryptedAccount;

            // Derive the stretched secret key
            const secretKey = await Account.derivePassword(this.password, encryptedAccount.rootPasswordSalt);

            // Decrypt the account to get the root key
            const rootKey = await Account.decryptAccount(secretKey, encryptedAccount);

            // Derive the identity keypair
            const keypair = await Account.deriveIdentityKeypair(rootKey);
            
            // Fetch and sign an authentication token
            const token = await (await tatsuyaService.getRegistrationToken()).data as AuthenticationToken;
            const signedToken = await Account.signAuthenticationToken(keypair, token);
            signedToken.username = this.username;

            // Submit the authentication token to the API and save the JWT session token
            const session = await tatsuyaService.loginAccount(signedToken);

            // Save the account key root
            Account.setRootKey(rootKey);

            // Save the JWT in Vuex
            this.store.dispatch("login", session.data);

            // Save the encrypted account payload
            // await Account.saveAccountToIDB(encryptedAccount);

            // Clear the fields
            this.username = "";
            this.password = "";

            // Push to discover page
            this.router.push({ path: "/" });

            // Dismiss loading controller
            a.dismiss();
          })
          .catch(async e => {
            a.dismiss();

            const error = await alertController.create({
              header: "Login error!",
              message: e,
              buttons: ["Close"]
            });

            return error.present();
          })
        });
    },
    register() {
      this.router.push({ path: "/auth/register" });
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router
    };
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 100px;
}

ion-card {
  box-shadow: none !important;
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