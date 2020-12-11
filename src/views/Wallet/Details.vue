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
      <ion-grid>
        <ion-row>
          <ion-col>
            <h4>Deposit address for {{ coin.name }}</h4>
            <img :src="addressQr" />
            <br />
            <br />
            <ion-button
              fill="clear"
              expand="block"
              class="address"
              color="primary"
              @click="share"
            >
              {{ address }}
            </ion-button>
            <ion-button expand="block" @click="clipboard">
              Copy to clipboard
            </ion-button>
            <p>
              Send any amount of {{ coin.name }} ({{
                upperTicker.toUpperCase()
              }}) to this address.
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>
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
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonBackButton,
  loadingController,
  alertController,
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
    IonGrid,
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
      isLoading: false,
    };
  },
  methods: {
    share() {
      navigator.share({
        title: `${this.coin.name} Address`,
        text: this.address,
      });
    },
    clipboard() {
      console.log("Copy to clipboard...")
    }
  },
  async ionViewWillEnter() {
    // Fetch coin information from wallet
    const ticker = this.$route.params.coin as string;

    // Set loading to true
    this.isLoading = true;

    // Begin the submitting process and show a loading popup
    await loadingController
      .create({
        message: "Loading address...",
      })
      .then((a) => {
        a.present()
          .then(async () => {
            await FindWallet(ticker).then(async (coin) => {
              this.coin = coin;
              this.upperTicker = coin.ticker;

              // Derive a new address
              this.address = await DeriveAddress(
                coin.extendedPublicKey,
                ticker
              );

              await QRCode.toDataURL(this.address, { width: 200 }).then(
                (qr) => {
                  this.addressQr = qr;
                }
              );

              this.isLoading = false;
            });
            if (!this.isLoading) {
              a.dismiss();
            }
          })
          .catch(async (err) => {
            this.isLoading = false;

            // Error alert
            const errorAlert = await alertController.create({
              header: "Error fetching address!",
              message: err,
              buttons: ["Okay!"],
            });
            errorAlert.present();
          });
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