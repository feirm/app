<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center">
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Identicon -->
      <div class="ion-text-center" v-html="identicon"></div>
      <br>

      <ion-list lines="none">
        <ion-item>
          <ion-icon slot="start" color="primary" :icon="personOutline"></ion-icon>
          <ion-label>Username</ion-label>
          <ion-label slot="end" class="ion-text-right">{{ store.getters.getUsername }}</ion-label>
        </ion-item>

        <ion-item>
          <ion-icon slot="start" color="primary" :icon="keyOutline"></ion-icon>
          <ion-label>Identity Key</ion-label>
          <ion-label slot="end" class="ion-text-right">{{ identityPublicKey }}</ion-label>
        </ion-item>
      </ion-list>

      <br />
      <!-- Account information end -->

      <!-- Wallet actions start -->
      <ion-note>My Wallet</ion-note>
      <br />
      <br />

      <ion-list lines="none">
        <ion-item button="true" @click="encryptWalletPopup" :disabled="true">
          <ion-icon slot="start" color="primary" :icon="lockClosedOutline"></ion-icon>
          <ion-label>Encrypt Wallet</ion-label>
        </ion-item>
        <ion-item button="true" @click="deleteWallet" :disabled="!store.getters.walletExists">
          <ion-icon slot="start" color="danger" :icon="trashOutline"></ion-icon>
          <ion-label>Remove Wallet</ion-label>
        </ion-item>
      </ion-list>

      <br>
      <!-- Wallet actions end -->

      <!-- About information start -->
      <ion-note>About</ion-note>
      <br />
      <br />

      <ion-list lines="none">
        <ion-item @click="navigate('/tabs/settings/version')" button>
          <ion-icon slot="start" color="primary" :icon="arrowDownOutline"></ion-icon>
          <ion-label>App Version</ion-label>
          <ion-label slot="end" class="ion-text-right">{{ version }}</ion-label>
        </ion-item>
        <ion-item button="true" href="https://feirm.com/privacy-policy">
          <ion-icon slot="start" color="primary" :icon="documentLockOutline"></ion-icon>
          <ion-label>Privacy Policy</ion-label>
        </ion-item>
      </ion-list>

      <br>
      <!-- About information end -->

      <!-- Settings start -->
      <ion-note>Settings</ion-note>
      <br>
      <br>

      <ion-list lines="none">
        <ion-item>
          <ion-icon slot="start" color="dark" :icon="moonOutline"></ion-icon>
          <ion-label>Dark Mode</ion-label>
          <ion-toggle :checked="store.getters.darkModeEnabled" @ionChange="toggleDark($event)"></ion-toggle>
        </ion-item>
      </ion-list>

      <!-- Settings end -->
      
      <!-- Footer -->
      <ion-footer class="ion-no-border ion-padding ion-text-center">
        <ion-button color="danger" @click="logout" expand="block">Log out</ion-button>
      </ion-footer>
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
  IonTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonFooter,
  IonNote,
  IonList,
  IonIcon,
  IonToggle,
  alertController,
} from "@ionic/vue";
import {
  personOutline,
  keyOutline,
  trashOutline,
  lockClosedOutline,
  arrowDownOutline,
  documentLockOutline,
  moonOutline
} from "ionicons/icons";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { version } from "../../../package.json";
import { toSvg } from "jdenticon";
import Account from "@/class/account";

export default defineComponent({
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonLabel,
    IonButton,
    IonFooter,
    IonNote,
    IonList,
    IonIcon,
    IonToggle
  },
  data() {
    return {
      username: "",
      identityPublicKey: "",
      identicon: ""
    }
  },
  async mounted() {
    // As we store the encrypted payload of an account containing the public key
    // it can be pulled straight from IDB.
    // Much better than deriving the public key again
    const username = localStorage.getItem("username")!;
    const account = await Account.fetchAccountFromIDB(username);

    if (account) {
      const identicon = toSvg(account.rootPublicKey, 100);
      this.identityPublicKey = account.rootPublicKey;
      this.identicon = identicon;
    }
  },
  methods: {
    async logout() {
      const alert = await alertController.create({
        header: "Are you sure?",
        message:
          "This action will remove all data from the app, including wallets, so be sure you have a backup!",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Yes, log me out!",
            handler: () => {
              // Clear Vuex state
              this.store.dispatch("logout");
              this.store.dispatch("deleteWallet");

              // Push to login page
              this.router.push({ path: "/" });
            },
          },
        ],
      });

      return alert.present();
    },
    toggleDark(event) {
      const enableDarkMode = event.detail.checked;

      // Save toggle option
      this.store.commit("toggleDarkMode", enableDarkMode);
    },
    navigate(path: string) {
      return this.router.push({ path: path });
    },
    async deleteWallet() {
      const alert = await alertController.create({
        header: "Delete wallet",
        message:
          "Are you sure you want to delete your wallet? If you do not have your 24-word mnemonic phrase backed up, your funds are lost forever.",
        buttons: [
          {
            text: "No",
          },
          {
            text: "Yes",
            handler: async () => {
              this.store.dispatch("clearWallet");

              const alert = await alertController.create({
                header: "Operation successful!",
                message: "Your wallet was removed.",
                buttons: ["Okay"],
              });

              return alert.present();
            },
          },
        ],
      });

      return alert.present();
    },
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    return {
      router,
      store,
      version,
      personOutline,
      keyOutline,
      trashOutline,
      lockClosedOutline,
      arrowDownOutline,
      documentLockOutline,
      moonOutline
    };
  },
});
</script>