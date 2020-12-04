<template>
  <ion-page>
    <ion-header>
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
        <ion-title>New Contact</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-item-group>
        <ion-item>
          <ion-input v-model="firstName" placeholder="First Name" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="lastName" placeholder="Last Name" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="feirmId" placeholder="Feirm ID" type="text"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="phoneNumber" placeholder="Phone Number" type="tel"></ion-input>
        </ion-item>
        <ion-item>
          <ion-input v-model="email" placeholder="Email Address" type="email"></ion-input>
        </ion-item>
      </ion-item-group>
      <ion-button expand="block">Save</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonItemGroup,
  IonItem,
  IonInput,
  IonButton
} from "@ionic/vue";
import { informationCircleOutline } from "ionicons/icons";

export default defineComponent({
  name: "NewContact",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonItemGroup,
    IonItem,
    IonInput,
    IonButton
  },
  setup() {
    return {
      informationCircleOutline,
    };
  },
});
</script>