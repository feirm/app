<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar class="ion-text-left">
                <ion-title color="dark">Wallet Recovery</ion-title>
                <ion-buttons slot="end">
                    <ion-back-button :icon="closeOutline"></ion-back-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" :fullscreen="true">
            <ion-text>
                <p>In the box below, please write your 24-word wallet mnemonic. We will go ahead and re-create your wallet for you.</p>
            </ion-text>

            <!-- Mnemonic text area -->
            <ion-textarea class="import-area" auto-grow="true" inputmode="text" v-model="mnemonic"></ion-textarea>

            <!-- Import button -->
            <br>
            <ion-button expand="block" @click="importWallet(mnemonic)">Import</ion-button>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonPage,
    IonContent,
    IonHeader,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonText,
    IonTextarea,
    IonButton,
    loadingController,
    alertController
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "WalletRecovery",
    components: {
        IonPage,
        IonContent,
        IonHeader,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonText,
        IonTextarea,
        IonButton
    },
    data() {
        return {
            mnemonic: ""
        }
    },
    methods: {
        async importWallet(secret: string) {
            const wallet = hdWalletP2pkh;

            await loadingController.create({
                message: "Importing..."
            }).then(a => {
                a.present().then(async () => {
                    // Set mnemonic
                    wallet.setSecret(secret);

                    // Create Feirm wallet
                    wallet.addCoin("xfe");

                    // Set other wallet properties
                    const id = await wallet.getId();
                    wallet.setId(id);

                    // Establish WSS connection
                    wallet.establishWss("xfe");

                    // Set balance
                    wallet.setBalances("xfe", wallet.getXpub("xfe"));

                    // Save wallet (might be redundant due to setting balances)
                    // wallet.saveWallet();

                    // Dismiss
                    a.dismiss();

                    // Route to index
                    this.router.push({ path: "/" })
                })
                .catch(async e => {
                    a.dismiss();

                    const error = await alertController.create({
                        header: "Recovery error!",
                        message: e,
                        buttons: ["Close"]
                    })

                    return error.present();
                })
            })
        }
    },
    setup() {
        const router = useRouter();

        return {
            router,

            closeOutline
        }
    }
})
</script>

<style scoped>
.import-area {
  background-color: var(--ion-color-light);
  padding: 15px;
  min-height: 9.5em;
}
</style>