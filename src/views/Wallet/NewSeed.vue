<template>
    <ion-page>
        <ion-header class="ion-no-border">
            <ion-toolbar class="ion-text-left" color="transparent">
                <ion-buttons slot="start">
                    <ion-back-button color="dark"></ion-back-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" :fullscreen="true">
            <h3>Your wallet has been generated!</h3>

            <ion-text>
                <p>Please take a moment to write down this 24-word mnemonic phrase onto a piece of paper. It is your backup which can be used to restore access to your wallet.</p>
            </ion-text>
            
            <!-- Show mnemonic -->
            <ion-grid>
                <ion-row>
                    <!-- Words 1 - 8 -->
                    <ion-col>
                        <div v-for="(word, index) in splitMnemonic" v-bind:key="word">
                            <ion-chip v-if="index < 8">{{ index + 1 }}. {{ word }}</ion-chip>
                        </div>
                    </ion-col>

                    <!-- Words 9 - 16 -->
                    <ion-col>
                        <div v-for="(word, index) in splitMnemonic" v-bind:key="word">
                            <ion-chip v-if="index >= 8 && index < 16">{{ index + 1 }}. {{ word }}</ion-chip>
                        </div>
                    </ion-col>

                    <!-- Words 17 - 24 -->
                    <ion-col>
                        <div v-for="(word, index) in splitMnemonic" v-bind:key="word">
                            <ion-chip v-if="index >= 16">{{ index + 1 }}. {{ word }}</ion-chip>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>

            <ion-text>
                <p><b>⚠️ Warning!</b></p>
                <p>Without this backup, your funds are lost forever! Feirm is non-custodial, making us unable to recover them for you!</p>
            </ion-text>
        </ion-content>
        <ion-footer class="ion-no-border ion-padding">
            <ion-button expand="block" @click="backupTest">Next</ion-button>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonText,
    IonBackButton,
    IonButton,
    IonFooter,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    modalController,
    alertController,
    loadingController
} from "@ionic/vue";

import BackupMnemonic from "@/components/Wallet/Setup/BackupMnemonic.vue";
import HDWalletP2PKH from "@/class/wallets/hd-wallet-p2pkh";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default defineComponent({
    name: "NewSeed",
    components: {
        IonPage,
        IonContent,
        IonHeader,
        IonToolbar,
        IonText,
        IonBackButton,
        IonButton,
        IonFooter,
        IonChip,
        IonGrid,
        IonRow,
        IonCol
    },
    data() {
        return {
            mnemonic: "",
            splitMnemonic: [] as string[],
        }
    },
    methods: {
        async backupTest() {
            // Create a modal to go through the backup test
            const backupModal = await modalController.create({
                component: BackupMnemonic,
                componentProps: {
                    mnemonic: this.mnemonic
                }
            })

            // Show the backup modal
            backupModal.present();

            // Capture on dismiss
            await backupModal.onDidDismiss().then(async() => {
                await loadingController.create({
                    message: "Generating wallet..."
                }).then(a => {
                    a.present().then(async () => {
                        // Return to index
                        this.router.push({ path: "/" })
                        
                        // Generate a Feirm wallet
                        HDWalletP2PKH.addCoin("xfe");

                        // Fetch balances (likely none due to being a new wallet)
                        HDWalletP2PKH.setBalances("xfe", HDWalletP2PKH.getXpub("xfe"));

                        // Dismiss loading prompt
                        a.dismiss();
                    }).catch(async e => {
                        // Close loading controller and show an error
                        a.dismiss()

                        const error = await alertController.create({
                            header: "Error!",
                            message: e,
                            buttons: ["Close"]
                        })

                        error.present();
                    })
                })
            })
        }
    },
    async created() {
        // Fetch the wallet instance
        const wallet = HDWalletP2PKH;

        // Create a new mnemonic
        wallet.generateSecret();

        // Set and split mnemonic
        this.mnemonic = wallet.getSecret();
        this.splitMnemonic = this.mnemonic.split(" ");
    },
    setup() {
        const store = useStore();
        const router = useRouter();

        return {
            store,
            router
        }
    }
})
</script>