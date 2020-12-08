<template>
    <ion-page>
        <ion-header>
            <ion-toolbar class="ion-text-center">
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
                <ion-title>Storing your mnemonic</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" :fullscreen="true">
            <ion-text>
                <p>As the Feirm Platform is non-custodial, you own your private keys. In order to make it easy for you to backup and remember, we give you a string of 24 words. Please be sure to write these down on paper and store them securely. A digital copy is NOT recommended.</p>
                <p>Please note that if you lose these words, you will not be able to access your funds again, so be sure to save them carefully.</p>
            </ion-text>
            <h2 class="ion-text-center">
                <b>{{ mnemonic }}</b>
            </h2>
        </ion-content>
        <ion-footer class="ion-no-border ion-padding">
            <ion-toolbar>
                <ion-button expand="block">Next</ion-button>
            </ion-toolbar>
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
    IonTitle,
    IonText,
    IonBackButton,
    IonButton,
    IonFooter,
} from "@ionic/vue";
import { GenerateMnemonic } from "@/lib/wallet";

export default defineComponent({
    name: "NewSeed",
    components: {
        IonPage,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonText,
        IonBackButton,
        IonButton,
        IonFooter
    },
    data() {
        return {
            mnemonic: ""
        }
    },
    async mounted() {
        const seed = await GenerateMnemonic()
        this.mnemonic = seed;
    }
})
</script>