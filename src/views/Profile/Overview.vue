<template>
  <ion-page>
       <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
        <ion-item-group>
            <ion-item>
                <ion-label>Dark mode</ion-label>
                <ion-toggle @ionChange="toggleTheme($event)"></ion-toggle>
            </ion-item>
        </ion-item-group>
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
  IonItem,
  IonToggle,
  IonItemGroup
} from "@ionic/vue";
import { alertCircleOutline } from "ionicons/icons";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonToggle,
    IonItemGroup
  },
  methods: {
      toggleTheme(event: any) {
          if (event.detail.checked) {
              console.log("Dark mode!")
              document.body.classList.toggle('dark', true);
          } else {
              console.log("Light mode!")
              document.body.classList.toggle('light', true);
          }
      }
  },
  setup() {
    return {
      alertCircleOutline,
    };
  },
});
</script>