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
            <ion-card>
              <ion-card-content>
                <form @submit.prevent="login">
                  <ion-item>
                    <ion-label position="floating">Username</ion-label>
                    <ion-input v-model="username"></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Password</ion-label>
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
import { loginAccount } from "@/lib/account";
import { useRouter } from "vue-router";

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

      // Commit username + password to Vuex
      this.store.commit("loginUsername", this.username);
      this.store.commit("loginPassword", this.password);

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

      // Store the PIN in Vuex along with our other login details
      this.store.commit("loginPin", pin);

      // Attempt to sign in
      await loadingController
        .create({
          message: "Signing in...",
        })
        .then(async (a) => {
          a.present().then(async () => {
            await loginAccount(
              this.store.getters.getLoginState.username,
              this.store.getters.getLoginState.password,
              this.store.getters.getLoginState.pin
            )
              .then(() => {
                // Dimiss the loading controller
                a.dismiss();
              })
              .catch(async (err) => {
                // Dismiss loading controller
                a.dismiss();

                // Return an error
                const alert = await alertController.create({
                  header: "Sign in error!",
                  message: err.response.data.error,
                  buttons: ["Okay"],
                });

                return alert.present();
              });
          });
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