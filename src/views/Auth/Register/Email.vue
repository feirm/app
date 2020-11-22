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
                If you wish, you can enter your E-mail address to receive messages about the status of your Feirm account. This is optional.
              </p>
            </ion-text>
            <form @submit.prevent>
              <ion-item>
                <ion-label position="floating">Email Address</ion-label>
                <ion-input type="email" :autofocus="true" v-bind="email"></ion-input>
              </ion-item>
            </form>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-button expand="full" color="primary" @click="next">Next</ion-button>
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
          router.push({ path: '/auth/register/password' })
      }
  },
  setup() {
    return {
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