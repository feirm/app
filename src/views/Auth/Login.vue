<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-img src="/assets/logo.png"></ion-img>
            <ion-text class="ion-text-center">
              <h1>Welcome to Feirm.</h1>
              <p>Please Login or Register to continue.</p>
            </ion-text>
            <ion-card>
              <ion-card-content>
                <form @submit.prevent>
                  <ion-item>
                    <ion-label position="floating">Username</ion-label>
                    <ion-input></ion-input>
                  </ion-item>
                  <ion-item>
                    <label position="floating">Password</label>
                    <ion-input></ion-input>
                  </ion-item>
                  <br />
                  <ion-button expand="block">Login</ion-button>
                  <ion-button expand="block" color="dark">Register</ion-button>
                </form>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IonPage, IonContent } from "@ionic/vue";

export default defineComponent({
  name: "Login",
  components: {
    IonPage,
    IonContent,
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 100px;
}

ion-grid{
    height: 100%;
}

ion-row{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>