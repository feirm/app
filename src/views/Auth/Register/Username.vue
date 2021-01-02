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
              <p>
                This is how other Feirm users can find you and send you
                payments.
              </p>
              <p>You should know that usernames cannot be changed, so pick wisely! 🧙‍♂️</p>
            </ion-text>
            <ion-item>
              <ion-label position="floating">Username</ion-label>
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
import { useStore } from "vuex";
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
import router from "@/router";
import { defineComponent } from "vue";
import tatsuyaService from "@/apiService/tatsuyaService";

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
      this.store.commit("registerUsername", this.username);
      router.push({ path: "/auth/register/password" });
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
    // Use existing store
    const store = useStore();

    return {
      store,
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