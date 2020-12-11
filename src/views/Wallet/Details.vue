<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>{{ coin.name }} ({{ upperTicker.toUpperCase() }})</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding ion-text-center">
      <h1>Receiving Address</h1>
      <img :src="addressQr" />
      <br />
      <br />
      <code>
        {{ address }}
      </code>
      <p>Send any amount of {{ coin.name }} ({{ upperTicker.toUpperCase() }}) to this address.</p>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding">
      <ion-row>
        <ion-col>
          <ion-fab-button color="light" size="small">
            <ion-icon :icon="arrowUpOutline"></ion-icon>
          </ion-fab-button>
        </ion-col>
        <ion-col>
          <ion-fab-button color="light" size="small">
            <ion-icon :icon="refreshCircleOutline"></ion-icon>
          </ion-fab-button>
        </ion-col>
        <ion-col>
          <ion-fab-button
            color="light"
            size="small"
            @click="
              router.push({
                path:
                  '/tabs/wallet/' +
                  store.getters.getWalletId +
                  '/' +
                  coin.ticker +
                  '/settings',
              })
            "
          >
            <ion-icon :icon="settingsOutline"></ion-icon>
          </ion-fab-button>
        </ion-col>
      </ion-row>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonFabButton,
  IonIcon,
  IonRow,
  IonCol,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
} from "@ionic/vue";
import {
  arrowUpOutline,
  refreshCircleOutline,
  settingsOutline,
} from "ionicons/icons";
import QRCode from "qrcode";
import { useStore } from "vuex";
import { Coin, DeriveAddress, FindWallet } from "@/lib/wallet";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Details",
  components: {
    IonPage,
    IonContent,
    IonFabButton,
    IonIcon,
    IonRow,
    IonCol,
    IonFooter,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonBackButton,
  },
  data() {
    return {
      addressQr: "",
      address: "" as any,
      upperTicker: "",
      coin: {} as Coin,
    };
  },
  async ionViewWillEnter() {
    // Fetch coin information from wallet
    const ticker = this.$route.params.coin as string;

    const coin = await FindWallet(ticker);
    this.coin = coin;
    this.upperTicker = coin.ticker;

    // Derive a new address from the Xpub and Index
    this.address = DeriveAddress(coin.extendedPublicKey, coin.index);
    QRCode.toDataURL(this.address, { width: 200 }).then((qr) => {
      this.addressQr = qr;
    });
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    return {
      store,
      router,
      arrowUpOutline,
      refreshCircleOutline,
      settingsOutline,
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

code {
  padding: 15px;
  font-size: 12px;
}
</style>