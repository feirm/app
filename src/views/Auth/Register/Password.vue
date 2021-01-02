<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="presentAlert">
            <ion-icon
              slot="icon-only"
              :icon="informationCircleOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-icon :icon="keyOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Create a password</h1>
              <p>
                It is important to secure your Feirm account with a strong
                password, as this is used to encrypt your account data (your
                Feirm identity).
              </p>
              <p>
                Be sure to keep your password safe as it cannot be reset or
                recovered by us! 🔒
              </p>
            </ion-text>
            <ion-item>
              <ion-label position="floating">Password</ion-label>
              <ion-input type="password" v-model="password"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Confirm Password</ion-label>
              <ion-input type="password" v-model="confirmPassword"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="primary" @click="next">Next</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonInput,
  IonLabel,
  IonItem,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonFooter,
  alertController,
  modalController,
  loadingController,
} from "@ionic/vue";
import { keyOutline, informationCircleOutline } from "ionicons/icons";
import zxcvbn from "zxcvbn";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import PIN from "@/components/Auth/PIN.vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import { generateAccount } from "@/lib/account";

export default defineComponent({
  name: "RegisterUsername",
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    IonInput,
    IonLabel,
    IonItem,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonFooter,
  },
  data() {
    return {
      password: "",
      confirmPassword: "",
    };
  },
  methods: {
    async next() {
      // Validate the passwords before moving on
      
      // Check that a password is actually present
      if (this.password.length === 0) {
        const alert = await alertController.create({
          header: "Password Error",
          message:
            "The password field cannot be empty. Please try again!",
          buttons: ["Okay!"],
        });

        return alert.present();
      }

      // Verify if the passwords match
      if (this.password !== this.confirmPassword) {
        const alert = await alertController.create({
          header: "Password Error",
          message:
            "The passwords do not match. Please double check your password and try again.",
          buttons: ["Okay!"],
        });

        return alert.present();
      }

      // Generate a zxcvbn score for the password
      const score = zxcvbn(this.password).score;

      // Set the password strength message based on our score
      const passwordMessage = this.passwordStrengthMessages[score];

      // If the password has a high score, save the password in our state and move on
      if (score > 2) {
        this.store.commit("registerPassword", this.password);

        // Modal to show first PIN entry screen
        const firstPin = await modalController.create({
          component: PIN,
          componentProps: {
            header: "Create a PIN",
            description: "Enter a six-digit PIN to secure your Feirm account.",
          },
        });

        firstPin.present();

        // Wait for a response to get our first PIN
        const firstPinResponse = await firstPin.onDidDismiss();
        const pin = firstPinResponse.data;

        // If the response is less than 6 characters, assume its empty, or they wanted to cancel, so go no further
        if (pin.length < 6) {
          return;
        }

        // Modal to show confirmation PIN entry screen
        const secondPin = await modalController.create({
          component: PIN,
          componentProps: {
            header: "Confirm your PIN",
            description: "Please re-enter your PIN from the previous screen.",
          },
        });

        secondPin.present();

        // Wait for a respond to get the second PIN
        const secondPinResponse = await secondPin.onDidDismiss();
        const confirmPin = secondPinResponse.data;

        // Compare the PINs and check if they match
        if (pin !== confirmPin) {
          const errorAlert = await alertController.create({
            header: "PIN Error!",
            message: "The PINs you provided do not match, please try again!",
            buttons: ["Close"],
          });

          return errorAlert.present();
        }

        // Assume the PINs match, so then update the PIN state
        this.store.commit("registerPin", pin);

        // Submit the account object from our state
        // Begin the submitting process and show a loading popup
        await loadingController
          .create({
            message: "Creating account...",
          })
          .then((a) => {
            a.present().then(async () => {
              const signUpInfo = this.store.getters.getRegistration;

              const account = await generateAccount(
                signUpInfo.username,
                signUpInfo.password,
                signUpInfo.pin
              );

              await tatsuyaService
                .registerAccount(account)
                .then((res) => {
                  // Account data
                  const username = res.data.username;
                  const sessionToken = res.data.sessionToken;
                  const rootKey = this.store.getters.getRootKey;

                  // Save authentication tokens
                  this.store.dispatch("login", {
                    username,
                    sessionToken,
                    rootKey,
                  });

                  // Dismiss the loading controller
                  a.dismiss();

                  // Push to Discover page
                  this.router.push({ path: "/" });
                })
                // Stop the loading popup and show an alert
                .catch(async (err) => {
                  a.dismiss();

                  // Error alert
                  const errorAlert = await alertController.create({
                    header: "Registration Error",
                    message: err.response.data.error,
                    buttons: ["Okay!"],
                  });
                  errorAlert.present();
                });
            });
          });
      } else {
        const alert = await alertController.create({
          header: "Password Strength Error",
          message: passwordMessage,
          buttons: ["Okay!"],
        });

        return alert.present();
      }
    },
    async presentAlert() {
      const alert = await alertController.create({
        header: "Password Requirements",
        message:
          "A strong password is required to create a Feirm account. We suggest using a password manager, or a combination of letters, numbers and symbols to create your password.",
        buttons: ["Okay, got it!"],
      });
      return alert.present();
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const passwordStrengthMessages = [
      "Very weak password! 😩",
      "Weak password! 🙁",
      "Medium password! 😐",
      "Strong password! 🙂",
      "Very strong password! 😁",
    ];

    return {
      store,
      router,
      passwordStrengthMessages,
      keyOutline,
      informationCircleOutline,
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
</style>