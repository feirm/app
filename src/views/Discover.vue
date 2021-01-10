<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Discover</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Platform statistics -->
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-card>
            <ion-card-content>
              <h2>{{ users }}</h2>
              <p>users</p>
            </ion-card-content>
          </ion-card>
        </ion-col>
        <ion-col>
          <ion-card>
            <ion-card-content>
              <h2>${{ xfePrice }}</h2>
              <p>XFE</p>
            </ion-card-content>
          </ion-card>
        </ion-col>
      </ion-row>

      <!-- Content goes in here -->
      <ion-item-group>
        <!-- <ion-list-header>Explore the Feirm Ecosystem</ion-list-header> -->
        <ion-item
          v-for="service in services"
          :key="service.Name"
          :router-link="service.Route"
          lines="none"
          color="light"
          button="true"
        >
          <ion-icon slot="end" :icon="service.Icon" color="primary"></ion-icon>
          <ion-label>{{ service.Name }}</ion-label>
        </ion-item>
      </ion-item-group>

      <br />

      <ion-item-group>
        <ion-list-header>Need assistance?</ion-list-header>
        <ion-item
          href="https://discord.gg/mUZdSKg"
          lines="none"
          color="light"
          button="true"
        >
          <ion-icon slot="end" :icon="logoDiscord" color="primary"></ion-icon>
          <ion-label>Discord</ion-label>
        </ion-item>
        <ion-item
          href="https://t.me/Feirm"
          lines="none"
          color="light"
          button="true"
        >
          <ion-icon
            slot="end"
            :icon="paperPlaneOutline"
            color="primary"
          ></ion-icon>
          <ion-label>Telegram</ion-label>
        </ion-item>
        <ion-item
          href="https://twitter.com/_feirm"
          lines="none"
          color="light"
          button="true"
        >
          <ion-icon slot="end" :icon="logoTwitter" color="primary"></ion-icon>
          <ion-label>Twitter</ion-label>
        </ion-item>
      </ion-item-group>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonItemGroup,
  IonListHeader,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  alertController,
  modalController,
} from "@ionic/vue";

import {
  logoDiscord,
  gameControllerOutline,
  paperPlaneOutline,
  logoTwitter,
} from "ionicons/icons";
import tatsuyaService from "@/apiService/tatsuyaService";
import { onMounted, ref } from "vue";
import axios from "axios";
import { useStore } from "vuex";
import { decryptWallet } from "@/lib/encryptWallet";
import PIN from "@/components/Auth/PIN.vue";
import { Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";

export default {
  name: "Discover",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonItem,
    IonLabel,
    IonItemGroup,
    IonListHeader,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
  },
  setup() {
    async function notAvailableAlert(service: string) {
      const alert = await alertController.create({
        header: "Not available!",
        message: `${service} is not available at this time!`,
        buttons: ["Okay!"],
      });

      return alert.present();
    }

    const store = useStore();
    const router = useRouter();

    const users = ref(0);
    const xfePrice = ref(0);

    onMounted(async () => {
      // Fetch platform statistics
      await tatsuyaService.userCount().then((res) => {
        users.value = parseFloat(res.data);
      });

      await axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=feirm&vs_currencies=usd"
        )
        .then((res) => {
          xfePrice.value = res.data.feirm.usd.toFixed(3);
        });
    });

    // Services interface
    interface Service {
      Name: string;
      Route: string;
      Icon: string;
    }

    // List of all services
    const services = [] as Service[];

    return {
      logoDiscord,
      gameControllerOutline,
      paperPlaneOutline,
      logoTwitter,
      notAvailableAlert,
      services,
      users,
      xfePrice,
      store,
    };
  },
};
</script>