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
                <p>Please take a moment to write down this 24-word mnemonic phrase onto a piece of paper. It is your backup which can be used to restore access to your wallet. Without this backup, your funds are lost forever!</p>
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
        </ion-content>
        <ion-footer class="ion-no-border ion-padding">
            <ion-button expand="block" @click="router.push({ path: '/wallet/backupSeed' })">Next</ion-button>
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
    IonCol
} from "@ionic/vue";
import { GenerateMnemonic } from "@/lib/wallet";
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
            splitMnemonic: [] as string[]
        }
    },
    mounted() {
        const seed = GenerateMnemonic();
        this.mnemonic = seed;
        this.splitMnemonic = seed.split(" ");

        // Store mnemonic in Vuex
        this.store.commit("setWalletMnemonic", seed);
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