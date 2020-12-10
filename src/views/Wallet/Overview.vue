<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Show if wallet is not present -->
      <ion-grid v-if="!store.getters.isWalletPresent">
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-img src="/assets/logo.png"></ion-img>
            <h1>Feirm Wallet</h1>
            <p>
              It appears that you don't have a wallet created. Would you like to
              get started, or restore from a backup? 💰
            </p>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Present the wallet/coins in a nice format -->
      <div v-if="store.getters.isWalletPresent">
        <ion-card color="light">
          <ion-card-content>
            <ion-col>
              <ion-row>
                <p>Balance</p>
              </ion-row>
              <ion-row>
                <h1>${{ fiatBalance }}</h1>
              </ion-row>
            </ion-col>
          </ion-card-content>
        </ion-card>

        <h6 class="ion-text-center">Your Wallets</h6>

        <!-- Showcase wallets/coins -->
        <ion-card
          color="light"
          button="true"
          @click="detailedWallet(store.getters.getWallet.id)"
        >
          <ion-card-content>
            <ion-item lines="none" color="light">
              <ion-avatar>
                <img
                  src="https://avatars0.githubusercontent.com/u/33553891?s=200&v=4"
                />
              </ion-avatar>
              <ion-grid>
                <ion-row>
                  <ion-col>
                    <p class="ion-text-right">Feirm (XFE)</p>
                  </ion-col>
                  <ion-col>
                    <ion-text color="primary">
                      <p class="ion-text-center">{{ balance }} XFE</p>
                    </ion-text>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </ion-item>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
    <!-- Show footer if wallet is not present -->
    <ion-footer
      v-if="!store.getters.isWalletPresent"
      class="ion-no-border ion-padding ion-text-center"
    >
      <ion-button
        expand="block"
        @click="router.push({ path: '/tabs/wallet/newSeed' })"
        >Get Started</ion-button
      >
      <ion-note color="dark">Restore from backup</ion-note>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonButton,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonCard,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonText,
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";
import { GenerateMnemonic, Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import blockBookService from "@/apiService/blockBookService";
import axios from "axios";
import { useStore } from "vuex";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonButton,
    IonFooter,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonCard,
    IonCardContent,
    IonItem,
    IonAvatar,
    IonText,
  },
  data() {
    return {
      balance: 0,
      fiatBalance: 0 as any,
      wallet: {} as Wallet,
    };
  },
  async ionViewWillEnter() {
    if (this.store.getters.isWalletPresent) {
      try {
        // Fetch account balance
        setInterval(async () => {
          await blockBookService
            .getXpub(this.store.getters.getWallet.coin.extendedPublicKey)
            .then((res) => {
              this.balance = Number(res.data.balance);

              // Update account index
              const wallet = this.store.getters.getWallet as Wallet;
              wallet.coin.index = res.data.usedTokens;
              localStorage.setItem("wallet", JSON.stringify(wallet));
            });
        }, 2000);
      } catch (e) {
        console.log(e);
      }

      // Fetch the Feirm USD price
      await axios
        .get(
          "https://api.coingecko.com/api/v3/simple/price?ids=feirm&vs_currencies=usd"
        )
        .then((res) => {
          this.fiatBalance = res.data.feirm.usd * this.balance;
        });
    }
  },
  methods: {
    detailedWallet(id: string) {
      this.router.push("/tabs/wallet/" + id);
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      walletOutline,
      GenerateMnemonic,
    };
  },
});
</script>

<style scoped>
ion-img {
  margin: 0 auto;
  width: 100px;
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