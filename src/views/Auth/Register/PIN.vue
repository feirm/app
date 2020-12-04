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
            <ion-icon :icon="appsOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Create a PIN</h1>
              <p>
                To provide your account with extra security, we force all users
                to set a six-digit PIN code. The PIN code will be required when
                logging into your Feirm account.
              </p>
            </ion-text>
          </ion-col>
        </ion-row>
        <!-- PIN Digits -->
        <ion-row class="ion-text-center ellipses">
          <ion-col>
            <ion-icon
              :icon="pin.length >= 1 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="pin.length >= 2 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="pin.length >= 3 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="pin.length >= 4 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="pin.length >= 5 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
          <ion-col>
            <ion-icon
              :icon="pin.length >= 6 ? ellipse : ellipseOutline"
            ></ion-icon>
          </ion-col>
        </ion-row>

        <br />
        <!-- Numbers 1, 2, 3 -->
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(1)"
              >1</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(2)"
              >2</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(3)"
              >3</ion-button
            >
          </ion-col>
        </ion-row>

        <!-- Numbers 4, 5, 6 -->
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(4)"
              >4</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(5)"
              >5</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(6)"
              >6</ion-button
            >
          </ion-col>
        </ion-row>

        <!-- Numbers 7, 8, 9 -->
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(7)"
              >7</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(8)"
              >8</ion-button
            >
          </ion-col>
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(9)"
              >9</ion-button
            >
          </ion-col>
        </ion-row>

        <!-- Number 0 -->
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-button
              size="large"
              fill="outline"
              shape="round"
              @click="handleInput(0)"
              :disabled="clickInProgress"
              >0</ion-button
            >
          </ion-col>
        </ion-row>

        <!-- Clear label -->
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-button fill="clear" color="dark" @click="clearInput"
              >Clear</ion-button
            >
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-button expand="full" color="primary" @click="next"
      >Create Account</ion-button
    >
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  alertController,
  loadingController,
} from "@ionic/vue";
import {
  informationCircleOutline,
  appsOutline,
  ellipseOutline,
  ellipse,
} from "ionicons/icons";
import { useStore } from "vuex";
import { generateAccount } from "@/lib/account";
import tatsuyaService from "@/apiService/tatsuyaService";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "PIN",
  components: {
    IonContent,
    IonPage,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
  },
  data() {
    return {
      pin: "",
      confirmPin: "",
      isLoading: false
    }
  },
  methods: {
    handleInput(n: number) {
        this.pin += String(n);

        if (this.pin.length > 6) {
          return;
        }

        console.log(this.pin)
    },
    clearInput() {
      this.pin = "";
    },
    async next() {
      this.isLoading = true;
      this.store.commit("registerPin", Number(this.pin));

      // Check that both PINs match
      /*
      if (this.pin != this.confirmPin) {
        this.isLoading = false;

        const alert = await alertController.create({
          header: "PIN",
          message:
            "The PINs do not match. Please double check your PIN and try again.",
          buttons: ["Okay!"],
        });

        return alert.present();
      }
      */

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
              signUpInfo.email,
              signUpInfo.password,
              signUpInfo.pin
            );

            await tatsuyaService
              .registerAccount(account)
              .then((res) => {
                this.isLoading = false;

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

                // Push to Discover page
                this.router.push({ path: "/" });
              })
              // Stop the loading popup and show an alert
              .catch(async (err) => {
                this.isLoading = false;

                // Error alert
                const errorAlert = await alertController.create({
                  header: "Registration Error",
                  message: err.response.data.error,
                  buttons: ["Okay!"],
                });
                errorAlert.present();
              });

            if (!this.isLoading) {
              a.dismiss();
            }
          });
        });
    },
    async presentAlert() {
      const alert = await alertController.create({
        header: "Information",
        message:
          "In order to protect your encrypted account data from a brute-force attack, a username, password and PIN combination is required when signing in. Only you should know your PIN. Keep it a secret!",
        buttons: ["Okay!"],
      });

      return alert.present();
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
      informationCircleOutline,
      appsOutline,
      ellipse,
      ellipseOutline,
    };
  },
});
</script>

<style scoped>
.ellipses {
  padding: 0;
  margin: 0;
}
</style>