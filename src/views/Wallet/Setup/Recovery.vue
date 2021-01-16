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
            <ion-textarea class="import-area" auto-grow="true"></ion-textarea>

            <!-- Import button -->
            <br>
            <ion-button expand="block">Import</ion-button>
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
    IonButton
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";

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
    setup() {
        return {
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