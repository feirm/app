<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Wallet info -->
      <p>
        <b>Wallet Information</b>
      </p>
      <ion-item-group>
        <ion-item>
          <ion-label slot="start">Wallet ID</ion-label>
          <ion-label class="walletid">{{
            store.getters.getWalletId
          }}</ion-label>
        </ion-item>
      </ion-item-group>

      <!-- Specific coin info -->
      <p>
        <b>Coin Information</b>
      </p>
      <ion-item-group
        ><ion-item>
          <ion-label slot="start">Coin</ion-label>
          <ion-label class="walletid">{{ coin.name }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-label slot="start">Ticker</ion-label>
          <ion-label class="walletid">{{ coin.ticker }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-label slot="start">Blockbook URL</ion-label>
          <ion-label class="walletid">{{ coin.blockbook }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-label slot="start">Public Key</ion-label>
          <ion-label class="walletid">{{ coin.extendedPublicKey }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-label slot="start">Latest Derivation Path</ion-label>
          <ion-label class="walletid">{{ coin.index }}</ion-label>
        </ion-item>
      </ion-item-group>
      <br>
      <ion-button color="danger" expand="block" @click="hideWallet">Hide {{ coin.name }} Wallet</ion-button>
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
  IonButtons,
  IonBackButton,
  IonTitle,
  IonItemGroup,
  IonItem,
  IonLabel,
  IonButton,
  alertController
} from "@ionic/vue";
import { useStore } from "vuex";
import { Coin, FindWallet } from "@/lib/wallet";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "Settings",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonLabel,
    IonItemGroup,
    IonItem,
    IonButton
  },
  data() {
    return {
      coin: {} as Coin
    }
  },
  methods: {
    async hideWallet() {
      const alert = await alertController.create({
        header: "Do you want to hide this wallet?",
        message: "Don't worry, your funds won't be lost. This just removes the coin wallet from view. You can always add it again later!",
        buttons: [
          {
            text: "Cancel"
          },
          {
            text: "Confirm",
            handler: () => {
              // TODO Implement hide
              console.log("hiding wallet")
            }
          }
        ]
      })

      return alert.present();
    }
  },
  async ionViewWillEnter() {
    const ticker = this.$route.params.coin as string;

    // Fetch the coin
    const data = await FindWallet(ticker);
    this.coin = data;

    // Make ticker uppercase
    this.coin.ticker = this.coin.ticker.toUpperCase();
  },
  setup() {
    const store = useStore();

    return {
      store,
    };
  },
});
</script>

<style scoped>
.walletid {
  font-size: 10px;
}
</style>