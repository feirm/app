<template>
    <ion-content class="ion-padding" :fullscreen="true">
        <!-- QR Scanner -->
        <video id="qrStream"></video>
    </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonContent
} from "@ionic/vue";

export default defineComponent({
    name: "ScanQR",
    components: {
        IonContent
    },
    mounted() {
        // Start the scanning process
    }
})
</script>