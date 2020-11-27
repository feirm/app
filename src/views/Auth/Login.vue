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
                <form @submit.prevent>
                  <ion-item>
                    <ion-label position="floating">Username</ion-label>
                    <ion-input></ion-input>
                  </ion-item>
                  <ion-item>
                    <ion-label position="floating">Password</ion-label>
                    <ion-input type="password"></ion-input>
                  </ion-item>
                  <br />
                  <ion-button expand="block" @click="login">Login</ion-button>
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
} from "@ionic/vue";
import router from "@/router";

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
  methods: {
    login() {
      router.push({ path: "/auth/login/2fa" });
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