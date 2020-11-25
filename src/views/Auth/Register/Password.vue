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
            <ion-icon :icon="keyOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Create a password</h1>
              <p>
                It is important to secure your Feirm account with a strong
                password, as this is used to encrypt your account data. We are
                unable to reset it if you forget your password.
              </p>
            </ion-text>
            <form @submit.prevent>
              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input
                  type="password"
                  v-bind="password"
                  v-on:ionChange="validatePassword($event.target.value)"
                ></ion-input>
              </ion-item>
            </form>
            <p>{{ passwordMessage }}</p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-button expand="full" color="primary" @click="next" :disabled="buttonDisabled">Next</ion-button>
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
import zxcvbn from "zxcvbn";
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
  data() {
    return {
      passwordMessage: "",
      buttonDisabled: true
    };
  },
  methods: {
    next() {
      router.push({ path: '/auth/register/pin' })
    },
    validatePassword(password: string) {
      if (password.length > 1) {
        const score = zxcvbn(password).score;

        // Re-enable the button once the password score is > 3
        switch (score) {
          case 0:
            this.passwordMessage = this.passwordStrengthMessages.veryWeak;
            this.buttonDisabled = true;
            break;
          case 1:
            this.passwordMessage = this.passwordStrengthMessages.weak;
            this.buttonDisabled = true;
            break;
          case 2:
            this.passwordMessage = this.passwordStrengthMessages.medium;
            this.buttonDisabled = true;
            break;
          case 3:
            this.passwordMessage = this.passwordStrengthMessages.strong;
            this.buttonDisabled = false;
            break;
          case 4:
            this.passwordMessage = this.passwordStrengthMessages.veryStrong;
            this.buttonDisabled = false;
            break;
          default:
            break;
        }
      } else {
        // Reset the password message
        this.passwordMessage = "";
      }
    },
  },
  setup() {
    const password = "";

    const passwordStrengthMessages = {
      veryWeak: "Very weak password! 😩",
      weak: "Weak password! 🙁",
      medium: "Medium password! 😐",
      strong: "Strong password! 🙂",
      veryStrong: "Very strong password! 😁",
    };

    return {
      password,
      passwordStrengthMessages,
      keyOutline,
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