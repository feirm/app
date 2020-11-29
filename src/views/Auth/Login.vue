<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-img src="/assets/logo.png"></ion-img>
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
                  <ion-item>
                    <ion-label position="floating">PIN</ion-label>
                    <ion-input
                      v-model="pin"
                      maxlength="6"
                      minlength="6"
                      type="password"
                      inputmode="numeric"
                    ></ion-input>
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
    <ion-button expand="full" color="dark" @click="register"
      >Need an account?</ion-button
    >
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
  alertController,
  loadingController,
} from "@ionic/vue";
import router from "@/router";
import { loginAccount } from "@/lib/account";

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
  },
  data() {
    return {
      username: "",
      password: "",
      pin: "",
      isLoading: false,
    };
  },
  methods: {
    async login() {
      this.isLoading = true;

      await loadingController
        .create({
          message: "Signing you in...",
        })
        .then(async (a) => {
          a.present().then(async () => {
            await loginAccount(this.username, this.password, Number(this.pin))
              .then(() => {
                this.isLoading = false;
              })
              .catch(async (err) => {
                this.isLoading = false;

                const alert = await alertController.create({
                  header: "Sign in error!",
                  message: err.response.data.error,
                  buttons: ["Okay"],
                });

                return alert.present();
              });

            if (!this.isLoading) {
              a.dismiss();
            }
          });
        });
    },
    register() {
      router.push({ path: "/auth/register" });
    },
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