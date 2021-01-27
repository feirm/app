<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-left">
        <ion-title color="dark">Marketplace</ion-title>
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
              <ion-icon color="primary" :icon="addCircleOutline"></ion-icon>
              <ion-label>New</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button @click="navToChat">
              <ion-icon
                color="primary"
                :icon="chatbubbleEllipsesOutline"
              ></ion-icon>
              <ion-label>Chat</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button>
              <ion-icon color="primary" :icon="fileTrayFullOutline"></ion-icon>
              <ion-label>History</ion-label>
            </ion-tab-button>
          </ion-col>
          <ion-col size="3">
            <ion-tab-button>
              <ion-icon color="primary" :icon="storefrontOutline"></ion-icon>
              <ion-label>Store</ion-label>
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
              <!--
              <img
                src="https://scontent-lht6-1.xx.fbcdn.net/v/t1.0-0/p180x540/56764508_2455886691110958_2158473021906485248_o.jpg?_nc_cat=108&ccb=2&_nc_sid=3b2858&_nc_ohc=xkW6Qq8YAL8AX-bu93a&_nc_ht=scontent-lht6-1.xx&tp=6&oh=94b8fad152ef09bf88c571798bbcd44f&oe=60188D98"
              />
              -->
              <!-- <ion-card-header>
                <ion-text class="ion-text-left" color="dark">
                  <b>£210</b>
                </ion-text>
              </ion-card-header> -->
              <ion-card-content class="ion-text-center">
                  <h2>Coming soon to Feirm...</h2>
                  <!-- <p>Storage Containers</p>
                  <p style="font-size: 12px">Sold by: sscontainersUk</p> -->
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Necessary spacing to read last listings in full -->
      <br />
      <br />
      <br />
      <br />
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
  // IonCardHeader,
  IonCardContent,
  IonText,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonTabButton,
  IonIcon,
  IonImg,
  IonLabel,
} from "@ionic/vue";
import {
  chatbubbleEllipsesOutline,
  addCircleOutline,
  fileTrayFullOutline,
  storefrontOutline,
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
    // IonCardHeader,
    IonCardContent,
    IonText,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonTabButton,
    IonIcon,
    IonImg,
    IonLabel,
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