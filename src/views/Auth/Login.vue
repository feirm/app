<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-title class="ion-text-center">Login to your Feirm Account</ion-title>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent, IonTitle } from "@ionic/vue";

export default defineComponent({
  name: "Login",
  components: {
    IonPage,
    IonContent,
    IonTitle,
  },
});
</script>

<style>
body {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)),
    url("https://source.unsplash.com/daily?water") no-repeat center/cover fixed;
}

ion-content {
  --background: none;
}
</style>