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
            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary">Password</ion-label>
              <ion-input type="password" v-model="password" v-on:ionChange="checkPassword($event.target.value, confirmPassword)"></ion-input>
            </ion-item>
            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary">Confirm Password</ion-label>
              <ion-input type="password" v-model="confirmPassword" v-on:ionChange="checkPassword(password, $event.target.value)"></ion-input>
            </ion-item>

            <!-- Password message -->
            <ion-text>
              <p>{{ passwordMessage }}</p>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="primary" @click="next" :disabled="disabled">Next</ion-button>
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

import Account from "@/class/account";
import PIN from "@/components/Auth/PIN.vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import { AuthenticationToken } from "@/models/account";

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
      passwordMessage: "",
      disabled: true
    };
  },
  methods: {
    checkPassword(password: string, confirmPassword: string) {
      // Reset button enable state
      this.disabled = true;

      // Want to show the strength of the original password
      const score = zxcvbn(password).score;
      this.passwordMessage = this.passwordStrengthMessages[score];

      // If the comfirmation password has a length
      // then check it matches the main password
      if (confirmPassword) {
        if (confirmPassword !== password) {
          this.passwordMessage = "Passwords do not match!";
          return;
        }
      }

      // Check the score is must be more than or equal to 3 (strong)
      // Also check that confirmed password is present.
      // If so, enable the button
      if (confirmPassword) {
        if (score > 2) {
          this.disabled = false;
        }
      }
    },
    async next() {
      // Proceed to capturing the PIN entry
      const pin = await modalController.create({
        component: PIN,
        componentProps: {
          header: "Create a PIN",
          description: "Enter a six-digit PIN to secure your Feirm account."
        }
      });

      pin.present();

      // Capture the PIN component response
      const pinResponse = await (await pin.onDidDismiss()).data;

      // If the PIN is less than 6 characters, chances are the user wanted to cancel
      if (pinResponse.length < 6) {
        return;
      }

      // Proceed to capture the second user PIN for confirmation it was entered correctly
      const confirmPin = await modalController.create({
        component: PIN,
        componentProps: {
          header: "Confirm your PIN",
          description: "Please re-enter your PIN from the previous screen."
        }
      });

      confirmPin.present();

      // Capture the confirmation PIN component response
      const confirmPinResponse = await (await confirmPin.onDidDismiss()).data;

      // Compare the two PINs against each other to make sure that they match
      if (pinResponse !== confirmPinResponse) {
        const error = await alertController.create({
          header: "PIN Error!",
          message: "The PINs you provided do not match! Please try again.",
          buttons: ["Close"]
        });

        return error.present();
      }

      // Retrieve the username from LocalStorage
      const username = localStorage.getItem("username")!;

      // Open up a loading controller
      await loadingController.create({
        message: "Creating your account..."
      }).then(a => {
        a.present()
        .then(async () => {
          // Generate an encrypted account using data previously entered
          const encryptedAccount = await Account.generateAccount(username, this.password, pinResponse);
          
          // Retrieve an ephemeral authentication token
          const authenticationToken = await (await tatsuyaService.getRegistrationToken()).data as AuthenticationToken;

          // Decrypt the account payload we had just encrypted
          const rootKey = await Account.decryptAccount(this.password, encryptedAccount);

          // Reconstruct the identity (signing keypair) to sign the authentication token
          const keypair = await Account.deriveIdentityKeypair(rootKey);
          const signedAuthenticationToken = await Account.signAuthenticationToken(keypair, authenticationToken);

          // Attach the signed authentication token to the encrypted account object
          encryptedAccount.token!.id = signedAuthenticationToken.id;
          encryptedAccount.token!.signature = signedAuthenticationToken.signature;

          // Submit encrypted account to auth API
          await tatsuyaService.registerAccount(encryptedAccount).then(res => {
            console.log(res.data);
          })

          // Set authentication token (JWT) in Vuex

          // Save the encrypted account to IndexedDB

          // Registration process is complete, so we can now close the modal
          a.dismiss();
        })
        .catch(async e => {
          a.dismiss();

          const error = await alertController.create({
            header: "Error creating your account!",
            message: e,
            buttons: ["Close"]
          });

          return error.present();
        })
      }) 

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