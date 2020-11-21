<template>
  <ion-page>
    <ion-header>
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
            <ion-icon :icon="keyOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Create a password</h1>
              <p>
                It is important to secure your Feirm account with a secure
                password, as this is used to encrypt your account. If you lose
                it, we are unable to reset it for you due to how End-to-End
                Encryption works.
              </p>
            </ion-text>
            <form @submit.prevent>
              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input type="password" :autofocus="true"></ion-input>
              </ion-item>
              <ion-item>
                <ion-label position="floating">Confirm Password</ion-label>
                <ion-input type="password" :autofocus="true"></ion-input>
              </ion-item>
            </form>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-button expand="full" color="primary">Next</ion-button>
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
} from "@ionic/vue";
import { keyOutline } from "ionicons/icons";
import router from "@/router";

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
  },
  methods: {
    next() {
      // TODO Validate password

      if (this.email == "") {
        // Assume user does not want to enter an email address, so configure TOTP 2FA
        router.push({ path: "/auth/register/2fa" });
      } else {
        // TODO
      }
    },
  },
  setup() {
    const email = "";

    return {
      email,
      keyOutline
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