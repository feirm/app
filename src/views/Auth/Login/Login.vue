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
} from "@ionic/vue";
import router from "@/router";
import { useStore } from "vuex";

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
      isLoading: false,
    };
  },
  methods: {
    login() {
      if (this.username.length < 3) {
        return;
      }
      if (this.password.length < 1) {
        return;
      }

      // Commit username + password to Vuex
      this.store.commit("loginUsername", this.username);
      this.store.commit("loginPassword", this.password);

      router.push({ path: "/auth/login/pin" });
    },
    register() {
      router.push({ path: "/auth/register" });
    },
  },
  setup() {
    const store = useStore();

    return {
      store
    }
  }
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