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
          <ion-img src="/assets/logo.png"></ion-img>
          <hr />
          <ion-text class="ion-text-center">
            <p>
              Welcome. Transact freely with complete <b>privacy</b> and
              <b>security</b>.
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
            <ion-tab-button>
              <ion-icon
                color="primary"
                :icon="addCircleOutline"
              ></ion-icon>
              <ion-label>New</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button>
              <ion-icon
                color="primary"
                :icon="fileTrayFullOutline"
              ></ion-icon>
              <ion-label>History</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button>
              <ion-icon
                color="primary"
                :icon="storefrontOutline"
              ></ion-icon>
              <ion-label>Store</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button>
              <ion-icon
                color="primary"
                :icon="starOutline"
              ></ion-icon>
              <ion-label>Stars</ion-label>
            </ion-tab-button>
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
  IonTabButton,
  IonIcon,
  IonImg,
  IonLabel
} from "@ionic/vue";
import {
  chatbubbleEllipsesOutline,
  addCircleOutline,
  fileTrayFullOutline,
  storefrontOutline,
  starOutline
} from "ionicons/icons";
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
    IonTabButton,
    IonIcon,
    IonImg,
    IonLabel
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
      fileTrayFullOutline,
      storefrontOutline,
      starOutline
    };
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 42px;
}
</style>