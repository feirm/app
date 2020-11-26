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
    <ion-button
      expand="full"
      color="primary"
      @click="next"
      :disabled="buttonDisabled"
      >Next</ion-button
    >
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
  alertController,
} from "@ionic/vue";
import { keyOutline, informationCircleOutline } from "ionicons/icons";
import zxcvbn from "zxcvbn";
import router from "@/router";
import { generateAccount } from "@/lib/account";
import { useStore } from 'vuex';

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
      password: "",
      passwordMessage: "",
      buttonDisabled: true,
    };
  },
  methods: {
    next() {
      this.store.commit('registerPassword', this.password)

      router.push({ path: "/auth/register/pin" });
    },
    async validatePassword(password: string) {
      if (password.length > 1) {
        const score = zxcvbn(password).score;

        // Set password
        this.password = password;

        // Testing
        const a = await generateAccount("", "", password);
        console.log(a)

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

    const passwordStrengthMessages = {
      veryWeak: "Very weak password! 😩",
      weak: "Weak password! 🙁",
      medium: "Medium password! 😐",
      strong: "Strong password! 🙂",
      veryStrong: "Very strong password! 😁",
    };

    return {
      store,
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