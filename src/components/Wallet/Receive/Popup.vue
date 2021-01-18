<template>
    <ion-content :fullscreen="true" class="ion-padding" color="success">
        <p>Received TX</p>
    </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonContent
} from "@ionic/vue";

export default defineComponent({
    name: "ReceivePopup",
    components: {
        IonContent
    }
})
</script>