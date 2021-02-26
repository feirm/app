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
            <ion-icon :icon="personCircleOutline" size="large"></ion-icon>
            <ion-text class="ion-text-center">
              <h1>Pick your username</h1>
              <p>You should know that usernames cannot be changed, so pick wisely! 🧙‍♂️</p>
            </ion-text>
            <ion-item color="transparent" lines="none">
              <ion-label position="floating" color="primary">Username</ion-label>
              <ion-input
                v-model="username"
                debounce="250"
                v-on:ionChange="checkUsername($event.target.value)"
              ></ion-input>
            </ion-item>
            <p>{{ usernameCheckMessage }}</p>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding ion-text-center">
      <ion-button expand="block" color="primary" @click="next" :disabled="buttonDisabled">Next</ion-button>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
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
  IonFooter
} from "@ionic/vue";
import { personCircleOutline } from "ionicons/icons";
import { defineComponent } from "vue";
import tatsuyaService from "@/apiService/tatsuyaService";
import { useRouter } from "vue-router";

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
    IonFooter
  },
  data() {
    return {
      username: "",
      buttonDisabled: true,
      usernameCheckMessage: "",
    };
  },
  methods: {
    next() {
      // Set username in LocalStorage instead of Vuex
      // We want this to remain persistant
      localStorage.setItem("username", this.username);

      // Push to next page
      this.router.push({ path: "/auth/register/password" });
    },
    async checkUsername(username: string) {
      // Set username
      this.username = username;

      // Check that the username isn't taken and meets minimum requirements
      await tatsuyaService
        .checkUsername(username)
        .then((res) => {

          // Enable the button
          this.buttonDisabled = false;
          this.usernameCheckMessage = res.data;
        })
        .catch((err) => {
          // Disable the button
          this.buttonDisabled = true;
          this.usernameCheckMessage = err.response.data.error;
        });
    },
  },
  setup() {
    // Use existing router
    const router = useRouter();

    return {
      router,
      personCircleOutline,
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

.ion-toast {
  text-align: center;
}
</style>