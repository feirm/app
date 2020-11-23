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
            <ion-icon :icon="mailOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Enter your E-mail address</h1>
              <p>
                If you wish, you can enter your E-mail address to receive
                messages about the status of your Feirm account. This is
                optional.
              </p>
            </ion-text>
            <ion-item>
              <ion-label position="floating">Email Address</ion-label>
              <ion-input
                type="email"
                v-bind="username"
                v-on:ionChange="checkEmail($event.target.value)"
              ></ion-input>
            </ion-item>
            <p>{{ emailCheckMessage }}</p>
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
} from "@ionic/vue";
import { mailOutline } from "ionicons/icons";
import router from "@/router";
import tatsuyaService from "@/apiService/tatsuyaService";
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
      email: "",
      buttonDisabled: false,
      emailCheckMessage: "",
    };
  },
  methods: {
    next() {
      this.store.commit('registerEmail', this.email)

      router.push({ path: "/auth/register/password" });
    },
    async checkEmail(email: string) {
      // If the email field is empty, then assume the user does not want to supply one
      if (email.length === 0) {
        this.emailCheckMessage = ""; // Reset the email message
        return this.buttonDisabled = false;
      }

      // Update the email value
      this.email = email;

      // Check that the email is valid and not in use
      await tatsuyaService
        .checkEmail(email)
        .then((res) => {
          // Enable the button
          this.buttonDisabled = false;
          this.emailCheckMessage = res.data;
        })
        .catch((err) => {
          // Disable the button
          this.buttonDisabled = true;
          this.emailCheckMessage = err.response.data.error;
        });
    },
  },
  setup() {
    const store = useStore();

    return {
      store,
      mailOutline
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