<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-button>
            <ion-icon slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button color="primary" @click="navToChat">
            <ion-icon
              slot="icon-only"
              :icon="chatbubbleEllipsesOutline"
            ></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>Marketplace</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-text class="ion-text-center">
            <p>
              Welcome to the Feirm Marketplace. Transact freely with complete
              privacy and security.
            </p>
          </ion-text>
          <ion-searchbar color="dark" animated></ion-searchbar>
        </ion-card-content>
      </ion-card>
      <ion-grid>
        <!-- Quick options -->
        <ion-row>
          <ion-col>
            <p><b>Quick Actions</b></p>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="3">
            <ion-button color="light">
              <ion-icon
                slot="icon-only"
                color="primary"
                :icon="addCircleOutline"
              ></ion-icon>
            </ion-button>
          </ion-col>
          <ion-col size="3">
            <ion-button color="light">
              <ion-icon
                slot="icon-only"
                color="primary"
                :icon="cashOutline"
              ></ion-icon>
            </ion-button>
          </ion-col>
        </ion-row>

        <!-- Recent listings -->
        <ion-row>
          <ion-col>
            <p><b>Recent Listings</b></p>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 1 </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 2 </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card>
              <ion-card-content> Listing 3 </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { chatbubbleEllipsesOutline, addCircleOutline, cashOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Overview",
  components: {
    IonPage,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonCard,
    IonCardContent,
    IonText,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonButton,
    IonIcon,
  },
  methods: {
    navToChat() {
      this.router.push({ path: "/tabs/marketplace/chat" });
    },
  },
  setup() {
    // Get router instance
    const router = useRouter();

    return {
      router,

      chatbubbleEllipsesOutline,
      addCircleOutline,
      cashOutline
    };
  },
});
</script>