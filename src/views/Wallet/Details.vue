<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ coin.name }} ({{ ticker.toUpperCase() }})</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <ion-grid>
        <ion-row class="ion-text-center">
          <ion-col>
            <ion-fab-button color="primary">
              <ion-icon :icon="arrowUpOutline"></ion-icon>
            </ion-fab-button>
          </ion-col>
          <ion-col>
            <ion-fab-button color="success" @click="receiveModal">
              <ion-icon color="light" :icon="arrowDownOutline"></ion-icon>
            </ion-fab-button>
          </ion-col>
          <ion-col>
            <ion-fab-button color="warning">
              <ion-icon :icon="refreshCircleOutline"></ion-icon>
            </ion-fab-button>
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
  IonContent,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  modalController,
} from "@ionic/vue";
import {
  arrowUpOutline,
  arrowDownOutline,
  refreshCircleOutline,
} from "ionicons/icons";
import { useStore } from "vuex";
import { Coin, FindWallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import ReceivingAddress from "@/components/Wallet/ReceivingAddress.vue";

export default defineComponent({
  name: "Details",
  components: {
    IonPage,
    IonContent,
    IonFabButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonBackButton,
  },
  data() {
    return {
      coin: {} as Coin,
      ticker: ""
    };
  },
  async ionViewWillEnter() {
    // Fetch coin information from blockbook
    const ticker = this.$route.params.coin as string;

    await FindWallet(ticker).then((coin) => {
      this.coin = coin;
      this.ticker = coin.ticker;
    });
  },
  methods: {
    async receiveModal() {
      const modal = await modalController.create({
        component: ReceivingAddress,
        componentProps: {
          coin: this.coin.name,
          ticker: this.coin.ticker,
        },
      });

      return modal.present();
    },
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
      arrowUpOutline,
      arrowDownOutline,
      refreshCircleOutline,
    };
  },
});
</script>

<style scoped>
ion-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.address {
  font-size: 11px;
  font-weight: bold;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
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