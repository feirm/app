<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-title>Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Present the wallet/coins in a nice format -->
      <div>
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
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonText,
} from "@ionic/vue";
import { walletOutline } from "ionicons/icons";
import { Wallet } from "@/lib/wallet";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default defineComponent({
  name: "WalletOverview",
  components: {
    IonPage,
    IonContent,
    IonToolbar,
    IonTitle,
    IonHeader,
    IonGrid,
    IonRow,
    IonCol,
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
    const walletPresent = this.store.getters.isWalletPresent;
    if (!walletPresent) {
      // Assume the user has removed the wallet somehow, or they are a new user
      this.router.push({
        path: "/tabs/wallet/getStarted"
      })
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