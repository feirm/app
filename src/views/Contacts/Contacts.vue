<template>
    <ion-page>
        <ion-content :fullscreen="true" class="ion-padding"></ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonPage,
    IonContent
} from "@ionic/vue";

export default defineComponent({
    name: "Contacts",
    components: {
        IonPage,
        IonContent
    }
})
</script>